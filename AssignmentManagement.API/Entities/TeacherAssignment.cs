using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AssignmentManagement.API.Entities
{
    public class TeacherAssignment
    {
    public int Id { get; set; }
    public int TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public string ClassName { get; set; } = string.Empty; // e.g. "Class 6"
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}