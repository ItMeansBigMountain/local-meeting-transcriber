using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers;
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _um;
    private readonly SignInManager<AppUser> _sm;
    private readonly IConfiguration _cfg;
    private readonly ILogger<AuthController> _logger;

    public AuthController(UserManager<AppUser> um, SignInManager<AppUser> sm, IConfiguration cfg, ILogger<AuthController> logger)
    { 
        _um = um; 
        _sm = sm; 
        _cfg = cfg; 
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        _logger.LogInformation("🔐 REGISTER request received for email: {Email}", req.Email);
        
        try
        {
            var user = new AppUser { UserName = req.Email, Email = req.Email };
            var result = await _um.CreateAsync(user, req.Password);
            
            if (!result.Succeeded)
            {
                _logger.LogWarning("❌ REGISTER failed for {Email}: {Errors}", req.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                return BadRequest(result.Errors);
            }
            
            _logger.LogInformation("✅ REGISTER successful for {Email}", req.Email);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "💥 REGISTER error for {Email}", req.Email);
            throw;
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        _logger.LogInformation("🔑 LOGIN request received for email: {Email}", req.Email);
        
        try
        {
            var user = await _um.FindByEmailAsync(req.Email);
            if (user is null)
            {
                _logger.LogWarning("❌ LOGIN failed - user not found: {Email}", req.Email);
                return Unauthorized();
            }
            
            var signIn = await _sm.CheckPasswordSignInAsync(user, req.Password, false);
            if (!signIn.Succeeded)
            {
                _logger.LogWarning("❌ LOGIN failed - invalid password for: {Email}", req.Email);
                return Unauthorized();
            }

            var token = IssueJwt(user);
            _logger.LogInformation("✅ LOGIN successful for {Email}, token issued", req.Email);
            return new AuthResponse(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "💥 LOGIN error for {Email}", req.Email);
            throw;
        }
    }

    private string IssueJwt(AppUser user)
    {
        _logger.LogDebug("🎫 Issuing JWT token for user: {UserId}", user.Id);
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? "")
        };
        var token = new JwtSecurityToken(
            issuer: _cfg["Jwt:Issuer"],
            audience: _cfg["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);
        
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        _logger.LogDebug("🎫 JWT token issued successfully for user: {UserId}", user.Id);
        return tokenString;
    }
}
