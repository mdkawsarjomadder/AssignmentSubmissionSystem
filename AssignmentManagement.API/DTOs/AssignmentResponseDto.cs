namespace AssignmentManagement.API.DTOs;

public class AssignmentResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public bool IsPublished { get; set; }
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
}