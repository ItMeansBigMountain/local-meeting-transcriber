using System.Text;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);


// CORS policy
const string DevCors = "DevCors";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: DevCors, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8081",  // Expo web dev
                "http://127.0.0.1:8081",
                "http://localhost:19006", // Expo web (alt)
                "http://127.0.0.1:19006",
                "http://localhost:19000", // Expo Metro UI
                "http://localhost:19001",
                "http://localhost:19002",
                "http://localhost:5173"   // optional Vite
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
        // .AllowCredentials(); // only if you use cookies. For JWT header, keep it off.
    });
});



// DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// Identity
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// JWT
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// App services
builder.Services.AddScoped<TranscriptionService>();
builder.Services.AddScoped<SummaryService>();

builder.Services.AddControllers();

var app = builder.Build();

// Add request/response logging middleware
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    // Log incoming request
    logger.LogInformation("🌐 {Method} {Path} from {RemoteIp}",
        context.Request.Method,
        context.Request.Path,
        context.Connection.RemoteIpAddress);

    // Log request headers (excluding sensitive ones)
    var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
    if (!string.IsNullOrEmpty(authHeader))
    {
        logger.LogInformation("🔑 Authorization header present: {AuthType}",
            authHeader.StartsWith("Bearer ") ? "Bearer Token" : "Other");
    }

    await next();

    // Log response
    logger.LogInformation("📤 Response: {StatusCode} for {Method} {Path}",
        context.Response.StatusCode,
        context.Request.Method,
        context.Request.Path);
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles(); // for simple file serving if needed
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Simple static file route for audio (MVP)
app.MapGet("/file/{name}", (IConfiguration cfg, IWebHostEnvironment env, string name, ILogger<Program> logger) =>
{
    logger.LogInformation("📁 FILE request for: {FileName}", name);

    var root = Path.Combine(env.ContentRootPath, cfg["Storage:UploadsPath"] ?? "uploads");
    var path = Path.Combine(root, name);

    if (File.Exists(path))
    {
        logger.LogInformation("✅ File found: {FilePath}", path);
        return Results.File(path, "audio/wav");
    }
    else
    {
        logger.LogWarning("❌ File not found: {FilePath}", path);
        return Results.NotFound();
    }
});

app.Run();
