using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net;
using System.Web;

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
        HttpResponseData response = req.CreateResponse(HttpStatusCode.OK);
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            // var data = JsonSerializer.Deserialize<ContactMessage>(requestBody);
            // Parse URL-encoded form data
            var parsedQuery = HttpUtility.ParseQueryString(requestBody);

            var data = new ContactMessage(
                Name: parsedQuery["name"] ?? string.Empty,
                Email: parsedQuery["email"] ?? string.Empty,
                Message: parsedQuery["message"] ?? string.Empty
            );

            _logger.LogInformation($"Contact received: {data?.Name} <{data?.Email}>");

            // Basic validation for required fields
            if (string.IsNullOrEmpty(data.Name) || string.IsNullOrEmpty(data.Email) || string.IsNullOrEmpty(data.Message))
            {
                response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteStringAsync("Please provide name, email, and message.");
                return response;
            }

            // Send email
            var apiKey = _config["SENDGRID_API_KEY"];
            var toEmail = _config["TO_EMAIL"];
            var fromEmail = _config["FROM_EMAIL"];

            // Basic validation for SendGrid configuration
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(toEmail) || string.IsNullOrEmpty(fromEmail))
            {
                _logger.LogError("SendGrid API Key or email configurations are missing.");
                response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync("Server email configuration is incomplete.");
                return response;
            }
            
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, "Portfolio Site");
            var to = new EmailAddress(toEmail);
            var subject = "New Contact Message from Portfolio";
            var plainTextContent = $"Name: {data?.Name}\nEmail: {data?.Email}\n\nMessage:\n{data?.Message}";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, null);

            var result = await client.SendEmailAsync(msg);

            if (result.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Email sent successfully. Status Code: {result.StatusCode}");
                await response.WriteAsJsonAsync(new { success = true, message = "Message sent." });
            }
            else
            {
                string errorBody = await result.Body.ReadAsStringAsync();
                _logger.LogError($"SendGrid email failed. Status Code: {result.StatusCode}. Response Body: {errorBody}");
                response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteAsJsonAsync(new { success = false, message = "Failed to send message via email. Please try again later." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"An unexpected error occurred: {ex.Message}. Stack Trace: {ex.StackTrace}");
            response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(new { success = false, message = "An unexpected error occurred on the server." });
        }
        return response;
    }

    public record ContactMessage(string Name, string Email, string Message);
}