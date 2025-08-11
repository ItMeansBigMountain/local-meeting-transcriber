namespace Backend.Services;
public class SummaryService
{
    public async Task<string> SummarizeAsync(string transcript, CancellationToken ct = default)
    {
        // TODO: call Ollama via HTTP (localhost:11434) with your prompt
        await Task.Delay(100, ct);
        return "• Key decisions...\n• Action items...\n• Risks...";
    }
}
