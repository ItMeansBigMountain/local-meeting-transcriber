using System.Text;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// CORS
// ---------------------------
const string DevCors = "DevCors";

// Optional: load extra origins from config: "Cors:AllowedOrigins": ["http://localhost:8081", ...]
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

var defaultDevOrigins = new[]
{
    "http://localhost:8081",  // Expo web dev
    "https://localhost:8081",
    "http://127.0.0.1:8081",
    "https://127.0.0.1:8081",

    "http://localhost:19006", // Expo web (alt)
    "https://localhost:19006",

    "http://localhost:19000", // Expo Metro UI
    "http://localhost:19001",
    "http://localhost:19002",

    "http://localhost:5173"   // optional Vite
};

var allowedOrigins = defaultDevOrigins
    .Concat(configuredOrigins)
    .Distinct()
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCors, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
        // NOTE: Do NOT enable AllowCredentials unless you use cookies.
        // For JWT via Authorization header, you don't need credentials.
    });
});

// ---------------------------
// DB
// ---------------------------
// var isDev = builder.Environment.IsDevelopment();
// builder.Services.AddDbContext<AppDbContext>(opt =>
// {
//     if (isDev)
//         opt.UseSqlite(builder.Configuration.GetConnectionString("Default"));
//     else
//         opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
// });

// Dev: SQLite (keep SqlServer for prod if you want, but dev must point to UseSqlite)
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));



// ---------------------------
// Identity
// ---------------------------
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ---------------------------
// JWT Auth
// ---------------------------
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

// ---------------------------
// App Services
// ---------------------------
builder.Services.AddScoped<TranscriptionService>();
builder.Services.AddScoped<SummaryService>();

builder.Services.AddControllers();

var app = builder.Build();

// ---------------------------
// Middleware pipeline (order matters)
// ---------------------------

// Request/Response logging
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("🌐 {Method} {Path} from {RemoteIp}",
        context.Request.Method,
        context.Request.Path,
        context.Connection.RemoteIpAddress);

    var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
    if (!string.IsNullOrEmpty(authHeader))
    {
        logger.LogInformation("🔑 Authorization header present: {AuthType}",
            authHeader.StartsWith("Bearer ") ? "Bearer Token" : "Other");
    }

    await next();

    logger.LogInformation("📤 Response: {StatusCode} for {Method} {Path}",
        context.Response.StatusCode,
        context.Request.Method,
        context.Request.Path);
});

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Static files
app.UseStaticFiles();

// ✅ add routing explicitly
app.UseRouting();

// ✅ CORS must run BEFORE auth/authorization and BEFORE endpoints
app.UseCors(DevCors);

// Auth
app.UseAuthentication();
app.UseAuthorization();

// MVC / API endpoints
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
