namespace AssignmentManagement.API.Entities
{
    public class Subject
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g., "Mathematics"
        public int ClassGroupId { get; set; }
        public ClassGroup ClassGroup { get; set; } = null!;
        public int? TeacherId { get; set; }
        public User? Teacher { get; set; }
    }
}
