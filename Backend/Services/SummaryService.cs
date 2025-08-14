using System.Net.Http.Json;

namespace Backend.Services;
public class SummaryService
{
    private readonly HttpClient _http = new() { BaseAddress = new Uri("http://localhost:11434/") };
    private readonly string _model;

    public SummaryService(IConfiguration cfg)
    {
        _model = cfg["Ollama:Model"] ?? "llama3";
    }

    public async Task<string> SummarizeAsync(string text, CancellationToken ct = default)
    {
        var prompt = $"Summarize with bullet points:\n\n{text}\n\nInclude: key decisions, action items, blockers.";
        var req = new
        {
            model = _model,
            prompt,
            stream = false
        };

        var resp = await _http.PostAsJsonAsync("api/generate", req, ct);
        resp.EnsureSuccessStatusCode();
        var data = await resp.Content.ReadFromJsonAsync<OllamaResp>(cancellationToken: ct);
        return data?.response ?? "";
    }
    private record OllamaResp(string response);
}
