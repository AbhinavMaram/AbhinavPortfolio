// Azure Function in .NET 8
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

public class ContactFunction
{
    private readonly ILogger _logger;
    public ContactFunction(ILoggerFactory loggerFactory) => _logger = loggerFactory.CreateLogger<ContactFunction>();

    [Function("ContactFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "contact")] HttpRequestData req)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonSerializer.Deserialize<ContactMessage>(requestBody);
        _logger.LogInformation($"Contact received: {data?.Name} <{data?.Email}>: {data?.Message}");

        var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        await response.WriteStringAsync(JsonSerializer.Serialize(new { success = true, message = "Message received." }));
        return response;
    }

    public record ContactMessage(string Name, string Email, string Message);
}
