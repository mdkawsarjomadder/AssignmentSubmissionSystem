using System.Collections.Generic;

namespace AssignmentManagement.API.Entities
{
    public class ClassGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // Navigation property for users assigned to this class
        public ICollection<User>? Users { get; set; }
    }
}
