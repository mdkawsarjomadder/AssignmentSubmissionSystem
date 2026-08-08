using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.API.DTOs;

public class GradeSubmissionDto
{
    [Range(0, 1000)]
    public decimal MarksObtained { get; set; }

    public string Feedback { get; set; } = string.Empty;
}