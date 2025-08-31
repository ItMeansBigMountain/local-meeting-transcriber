namespace Backend.DTOs;
public record MeetingResponse(int Id, string? Title, string AudioUrl, string? Summary, string? Transcript, string? DiarizedTranscript, string CreatedUtc);
