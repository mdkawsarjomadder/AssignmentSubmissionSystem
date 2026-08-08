using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentManagement.API.Data;
using AssignmentManagement.API.DTOs;
using AssignmentManagement.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString()
        });
    }

  private string GenerateJwtToken(User user)
{
    var jwtSettings = _configuration.GetSection("Jwt");
    var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyForAssignmentManagementSystem2026SecureJwtAuthKey!";
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    // 🔴 user.Role.ToString() যেন "Student" রিটার্ন করে (Case-sensitive)
    string roleName = user.Role.ToString(); 

    var claims = new List<Claim>
    {
        new Claim("sub", user.Id.ToString()),
        new Claim("email", user.Email),
        new Claim("name", user.FullName),
        new Claim("role", roleName), // 🔴 Program.cs-এর RoleClaimType = "role" এর সাথে মেলানোর জন্য
        new Claim(ClaimTypes.Role, roleName), // .NET Fallback
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
    };

    var token = new JwtSecurityToken(
        issuer: jwtSettings["Issuer"] ?? "AssignmentAPI",
        audience: jwtSettings["Audience"] ?? "AssignmentClient",
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
}