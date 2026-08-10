using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.API.DTOs;
public class CreateAssignmentDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [Required]
    public DateTime Deadline { get; set; }
    [Range(1, 1000)]
    public decimal MaxMarks { get; set; } = 100;
    [Required]
    public int SubjectId { get; set; }
    [Required] // Class/Course বাধ্যতামূলক করতে [Required] দেওয়া হলো
    public int ClassId { get; set; } // <--- এই নতুন ফিল্ডটি যোগ করা হয়েছে
    public bool IsPublished { get; set; } = false;
}