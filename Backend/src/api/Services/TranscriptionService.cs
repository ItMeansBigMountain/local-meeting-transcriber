using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.Text.Json;

namespace Backend.Services;
public class TranscriptionService
{
    private readonly string _pythonPath;
    private readonly string _scriptPath;
    private readonly string? _hfToken;

    public TranscriptionService(IConfiguration cfg, IWebHostEnvironment env)
    {
        _pythonPath = Path.Combine(env.ContentRootPath, "pyenv", "Scripts", "python.exe"); // Windows venv
        if (!File.Exists(_pythonPath))
            _pythonPath = "python";

        _scriptPath = Path.Combine(env.ContentRootPath, "scripts", "whisperx_runner.py");
        _hfToken = Environment.GetEnvironmentVariable("HF_TOKEN") ?? cfg["AI:HF_TOKEN"];
    }

    public async Task<(string transcript, string diarized)> TranscribeAsync(string audioPath, CancellationToken ct = default)
    {
        var psi = new ProcessStartInfo
        {
            FileName = _pythonPath,
            ArgumentList = { _scriptPath, "--audio", audioPath },
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };
        if (!string.IsNullOrWhiteSpace(_hfToken))
            psi.Environment["HF_TOKEN"] = _hfToken!;

        using var p = Process.Start(psi)!;
        var stdout = await p.StandardOutput.ReadToEndAsync();
        var stderr = await p.StandardError.ReadToEndAsync();
        await p.WaitForExitAsync(ct);

        if (p.ExitCode != 0)
            throw new Exception($"whisperx_runner failed: {stderr}");

        var doc = JsonDocument.Parse(stdout);
        var transcript = doc.RootElement.GetProperty("transcript").GetString() ?? "";
        var diarized = doc.RootElement.GetProperty("diarized").GetString() ?? "";
        return (transcript, diarized);
    }
}
