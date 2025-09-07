using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace AbhinavPortfolio.Api;

/// <summary>
/// POST /api/chat — résumé-grounded portfolio assistant backed by an Ollama server.
/// Body: { "messages": [ { "role": "user" | "assistant", "content": "..." } ] }
/// Returns: { "reply": "..." }. The frontend falls back to an offline answerer on any non-200.
///
/// Settings:
///   OLLAMA_BASE_URL  e.g. http://localhost:11434 (local), https://ollama.com (Ollama Cloud), or your own server
///   OLLAMA_MODEL     e.g. llama3.2, qwen2.5:7b, gpt-oss:20b
///   OLLAMA_API_KEY   optional; sent as a Bearer token (needed for Ollama Cloud or a secured proxy)
/// </summary>
public partial class ChatFunction
{
    private const int MaxMessages = 12;
    private const int MaxCharsPerMessage = 1000;

    // Azure Static Web Apps managed functions time out at ~45s, so stay under that.
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(40) };
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };

    private readonly ILogger _logger;
    private readonly IConfiguration _config;

    public ChatFunction(ILoggerFactory loggerFactory, IConfiguration config)
    {
        _logger = loggerFactory.CreateLogger<ChatFunction>();
        _config = config;
    }

    [Function("ChatFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "chat")] HttpRequestData req)
    {
        var baseUrl = _config["OLLAMA_BASE_URL"]?.TrimEnd('/');
        var model = _config["OLLAMA_MODEL"];
        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(model))
        {
            _logger.LogWarning("OLLAMA_BASE_URL / OLLAMA_MODEL not configured; chat unavailable.");
            return await Error(req, HttpStatusCode.ServiceUnavailable, "Chat is not configured.");
        }

        ChatRequest? body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<ChatRequest>(req.Body, Json);
        }
        catch (JsonException)
        {
            return await Error(req, HttpStatusCode.BadRequest, "Invalid JSON.");
        }

        // Sanitize: keep the last N turns, valid roles only, trimmed length, must start with a user turn.
        var turns = (body?.Messages ?? [])
            .Where(m => (m.Role == "user" || m.Role == "assistant") && !string.IsNullOrWhiteSpace(m.Content))
            .TakeLast(MaxMessages)
            .Select(m => new OllamaMessage(m.Role!, m.Content!.Length > MaxCharsPerMessage ? m.Content[..MaxCharsPerMessage] : m.Content))
            .SkipWhile(m => m.Role != "user")
            .ToList();

        if (turns.Count == 0 || turns[^1].Role != "user")
            return await Error(req, HttpStatusCode.BadRequest, "Conversation must end with a user message.");

        var payload = new OllamaChatRequest(
            Model: model,
            Messages: [new OllamaMessage("system", ResumeContext.SystemPrompt), .. turns],
            Stream: false,
            Options: new OllamaOptions(Temperature: 0.3, NumPredict: 600, NumCtx: 8192));

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/chat")
            {
                Content = JsonContent.Create(payload),
            };
            var apiKey = _config["OLLAMA_API_KEY"];
            if (!string.IsNullOrWhiteSpace(apiKey))
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            using var response = await Http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var detail = await response.Content.ReadAsStringAsync();
                _logger.LogError("Ollama returned {Status}: {Detail}", (int)response.StatusCode, detail.Length > 500 ? detail[..500] : detail);
                return await Error(req, HttpStatusCode.BadGateway, "The assistant is unavailable right now.");
            }

            var result = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(Json);
            // Some reasoning models inline their chain of thought in <think> tags; never show it to visitors.
            var reply = ThinkTags().Replace(result?.Message?.Content ?? "", "").Trim();

            if (string.IsNullOrEmpty(reply))
                reply = "I can only help with questions about Abhinav's experience and skills — try asking about his roles, tech stack, or impact.";

            var ok = req.CreateResponse(HttpStatusCode.OK);
            await ok.WriteAsJsonAsync(new { reply });
            return ok;
        }
        catch (TaskCanceledException)
        {
            _logger.LogWarning("Ollama request timed out.");
            return await Error(req, HttpStatusCode.GatewayTimeout, "The assistant took too long to answer.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Could not reach Ollama at {BaseUrl}", baseUrl);
            return await Error(req, HttpStatusCode.BadGateway, "The assistant is unavailable right now.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected chat error");
            return await Error(req, HttpStatusCode.InternalServerError, "Unexpected error.");
        }
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string message)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(new { error = message }, code);
        return res;
    }

    [GeneratedRegex(@"<think>[\s\S]*?</think>", RegexOptions.IgnoreCase)]
    private static partial Regex ThinkTags();

    // ---- Incoming request from the browser ----
    public record ChatRequest([property: JsonPropertyName("messages")] List<ChatMessage>? Messages);
    public record ChatMessage(
        [property: JsonPropertyName("role")] string? Role,
        [property: JsonPropertyName("content")] string? Content);

    // ---- Ollama /api/chat wire format ----
    private record OllamaMessage(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("content")] string Content);
    private record OllamaOptions(
        [property: JsonPropertyName("temperature")] double Temperature,
        [property: JsonPropertyName("num_predict")] int NumPredict,
        [property: JsonPropertyName("num_ctx")] int NumCtx);
    private record OllamaChatRequest(
        [property: JsonPropertyName("model")] string Model,
        [property: JsonPropertyName("messages")] List<OllamaMessage> Messages,
        [property: JsonPropertyName("stream")] bool Stream,
        [property: JsonPropertyName("options")] OllamaOptions Options);
    private record OllamaChatResponse([property: JsonPropertyName("message")] OllamaMessage? Message);
}
