using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;
public class Meeting
{
    [Key] public int Id { get; set; }
    [Required] public string UserId { get; set; } = "";
    public string? Title { get; set; }
    public string AudioPath { get; set; } = "";
    public string? Transcript { get; set; }
    public string? DiarizedTranscript { get; set; }
    public string? Summary { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
