using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.API.DTOs;

public class SubmitAssignmentDto
{
    [Required]
    public int AssignmentId { get; set; }

    [Required]
    public string AnswerContent { get; set; } = string.Empty;
}