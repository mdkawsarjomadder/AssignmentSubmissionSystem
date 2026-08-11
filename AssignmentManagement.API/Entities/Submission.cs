namespace AssignmentManagement.API.Entities
{
    public class Submission
    {
        public int Id { get; set; }
        public string AnswerContent { get; set; } = string.Empty;
        public string? FilePath { get; set; } // 👉 ফাইল পাথের জন্য এই লাইনটি যোগ করুন
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public decimal? MarksObtained { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = "Submitted"; // Submitted, Graded
        public int AssignmentId { get; set; }
        public Assignment Assignment { get; set; } = null!;

        public int StudentId { get; set; }
        public User Student { get; set; } = null!;
    }
}
