using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MuebleriaCore.Services;

public class JwtService
{
    private readonly string  _key;
    private readonly string  _issuer;
    private readonly string  _audience;
    private readonly int     _expiryHours;

    public JwtService(IConfiguration config)
    {
        _key         = config["Jwt:SecretKey"]!;
        _issuer      = config["Jwt:Issuer"]!;
        _audience    = config["Jwt:Audience"]!;
        _expiryHours = int.Parse(config["Jwt:ExpiryHours"] ?? "12");
    }

    public string GenerateToken(long userId, string email, string role, string name)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email,          email),
            new Claim(ClaimTypes.Role,           role),
            new Claim(ClaimTypes.Name,           name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(_expiryHours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
