// Utilities/FfmpegAudio.cs
using System.Diagnostics;
public static class FfmpegAudio
{
    public static async Task<string> ToWav16kMonoAsync(string inputPath, string outDir)
    {
        Directory.CreateDirectory(outDir);
        var wavPath = Path.Combine(outDir, Path.GetFileNameWithoutExtension(inputPath) + "_16k.wav");

        var psi = new ProcessStartInfo("ffmpeg", $"-y -i \"{inputPath}\" -ac 1 -ar 16000 -f wav \"{wavPath}\"")
        { RedirectStandardError = true, RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true };
        using var p = Process.Start(psi)!;
        await p.WaitForExitAsync();
        if (p.ExitCode != 0) throw new Exception("ffmpeg failed to convert audio");
        return wavPath;
    }
}
