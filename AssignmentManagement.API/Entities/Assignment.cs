namespace AssignmentManagement.API.Entities
{
    public class Assignment
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public decimal MaxMarks { get; set; }
        public bool IsPublished { get; set; } = false;
        public int SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        public int CreatedById { get; set; }
        public User CreatedBy { get; set; } = null!;

        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
