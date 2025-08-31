using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;
[ApiController]
[Route("api/meetings")]
[Authorize]
public class MeetingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _cfg;
    private readonly TranscriptionService _transcriber;
    private readonly SummaryService _summarizer;

    public MeetingsController(AppDbContext db, IWebHostEnvironment env, IConfiguration cfg,
        TranscriptionService t, SummaryService s)
    { _db = db; _env = env; _cfg = cfg; _transcriber = t; _summarizer = s; }

    [HttpPost("upload")]
    [RequestSizeLimit(200_000_000)]
    public async Task<ActionResult<MeetingResponse>> Upload([FromForm] IFormFile file, [FromForm] string? title)
    {
        var userId = User.Claims.First(c => c.Type == "sub").Value;
        var uploadsRoot = Path.Combine(_env.ContentRootPath, _cfg["Storage:UploadsPath"] ?? "uploads");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var fullPath = Path.Combine(uploadsRoot, fileName);
        using (var fs = System.IO.File.Create(fullPath))
            await file.CopyToAsync(fs);

        var meeting = new Meeting { UserId = userId, Title = title, AudioPath = fullPath };
        _db.Meetings.Add(meeting);
        await _db.SaveChangesAsync();

        // Async post-process (simple inline for MVP)
        var (trans, diar) = await _transcriber.TranscribeAsync(fullPath);
        var summary = await _summarizer.SummarizeAsync(diar ?? trans);
        meeting.Transcript = trans;
        meeting.DiarizedTranscript = diar;
        meeting.Summary = summary;
        await _db.SaveChangesAsync();

        return ToDto(meeting);
    }

    [HttpGet]
    public async Task<IEnumerable<MeetingResponse>> List()
    {
        var userId = User.Claims.First(c => c.Type == "sub").Value;
        var items = await _db.Meetings.Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedUtc).ToListAsync();
        return items.Select(ToDto);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MeetingResponse>> Get(int id)
    {
        var userId = User.Claims.First(c => c.Type == "sub").Value;
        var m = await _db.Meetings.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (m is null) return NotFound();
        return ToDto(m);
    }

    private MeetingResponse ToDto(Meeting m) =>
        new(m.Id, m.Title, $"/file/{Path.GetFileName(m.AudioPath)}", m.Summary, m.Transcript, m.DiarizedTranscript, m.CreatedUtc.ToString("o"));
}
