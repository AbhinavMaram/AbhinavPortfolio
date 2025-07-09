using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Text.Json;
namespace AbhinavPortfolio.Api;
public class ContactFunction
{
    private readonly ILogger _logger;
    private readonly IConfiguration _config;

    public ContactFunction(ILoggerFactory loggerFactory, IConfiguration config)
    {
        _logger = loggerFactory.CreateLogger<ContactFunction>();
        _config = config;
    }

    [Function("ContactFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "contact")] HttpRequestData req)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonSerializer.Deserialize<ContactMessage>(requestBody);

        _logger.LogInformation($"Contact received: {data?.Name} <{data?.Email}>");

        // Send email
        var apiKey = _config["SENDGRID_API_KEY"];
        var toEmail = _config["TO_EMAIL"];
        var fromEmail = _config["FROM_EMAIL"];
        var client = new SendGridClient(apiKey);

        var from = new EmailAddress(fromEmail, "Portfolio Site");
        var to = new EmailAddress(toEmail);
        var subject = "New Contact Message from Portfolio";
        var plainTextContent = $"Name: {data?.Name}\nEmail: {data?.Email}\n\nMessage:\n{data?.Message}";
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, null);
        var result = await client.SendEmailAsync(msg);

        var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new { success = true, message = "Message sent." });
        return response;
    }

    public record ContactMessage(string Name, string Email, string Message);
}
