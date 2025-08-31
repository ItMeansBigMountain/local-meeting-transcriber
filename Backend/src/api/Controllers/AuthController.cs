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

    public AuthController(UserManager<AppUser> um, SignInManager<AppUser> sm, IConfiguration cfg)
    { _um = um; _sm = sm; _cfg = cfg; }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var user = new AppUser { UserName = req.Email, Email = req.Email };
        var result = await _um.CreateAsync(user, req.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var user = await _um.FindByEmailAsync(req.Email);
        if (user is null) return Unauthorized();
        var signIn = await _sm.CheckPasswordSignInAsync(user, req.Password, false);
        if (!signIn.Succeeded) return Unauthorized();

        var token = IssueJwt(user);
        return new AuthResponse(token);
    }

    private string IssueJwt(AppUser user)
    {
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
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
