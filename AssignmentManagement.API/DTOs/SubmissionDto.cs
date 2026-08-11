using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs // 👉 আপনার প্রজেক্টের আসল Namespace টি নাম লিখুন
{
    public class SubmissionDto
    {
        [Required]
        public int AssignmentId { get; set; }
        public string? AnswerContent { get; set; } = string.Empty;
        public IFormFile? File { get; set; } 
    }
}