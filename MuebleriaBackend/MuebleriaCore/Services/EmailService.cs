using System.Net;
using System.Net.Mail;

namespace MuebleriaCore.Services;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOrderConfirmationAsync(
        string toEmail, string clientName, string orderNumber, decimal total)
    {
        var host = _config["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogInformation("SMTP not configured — email skipped for order {order}", orderNumber);
            return;
        }

        try
        {
            var port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;
            var user = _config["Smtp:User"] ?? "";
            var pass = _config["Smtp:Password"] ?? "";
            var from = _config["Smtp:From"] ?? user;

            var body = $"""
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
                  <h2 style="color:#2e4a1e;">¡Gracias por tu compra, {clientName}!</h2>
                  <p>Tu orden <strong>{orderNumber}</strong> ha sido recibida y está siendo procesada.</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr>
                      <td style="padding:8px;border:1px solid #ddd;">Número de orden</td>
                      <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">{orderNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;border:1px solid #ddd;">Total</td>
                      <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Q{total:N2}</td>
                    </tr>
                  </table>
                  <p style="color:#666;font-size:13px;">
                    Nos pondremos en contacto contigo para confirmar los detalles de entrega.<br/>
                    <strong>Muebles Los Alpes</strong> — Guatemala
                  </p>
                </div>
                """;

            using var smtp = new SmtpClient(host, port)
            {
                EnableSsl   = true,
                Credentials = new NetworkCredential(user, pass),
            };

            var msg = new MailMessage(from, toEmail)
            {
                Subject    = $"Confirmación de orden {orderNumber} — Muebles Los Alpes",
                Body       = body,
                IsBodyHtml = true,
            };

            await smtp.SendMailAsync(msg);
            _logger.LogInformation("Confirmation email sent to {email} for order {order}", toEmail, orderNumber);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Email send failed for order {order}: {msg}", orderNumber, ex.Message);
        }
    }
}
