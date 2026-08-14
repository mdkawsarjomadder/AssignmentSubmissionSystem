using AssignmentManagement.API.Data;
using AssignmentManagement.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,1")] 
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // 1. GET: api/Admin/stats (Dashboard Overview Data)
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalSubjects = await _context.Subjects.CountAsync();
        var totalAssignments = await _context.Assignments.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalSubjects,
            totalAssignments
        });
    }

    // 2. GET: api/Admin/users (Fetch all registered users)
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                Name = u.FullName,
                u.Email,
                u.Role
            })
            .ToListAsync();

        return Ok(users);
    }
    // 3. GET: api/Admin/all-assignments
    [HttpGet("all-assignments")]
    public async Task<IActionResult> GetAllAssignments()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Subject)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                DueDate = a.Deadline,
                TeacherName = _context.Users
                    .Where(u => u.Id == a.CreatedById)
                    .Select(u => u.FullName)
                    .FirstOrDefault() ?? "Unknown Teacher",
                SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
                SubmissionsCount = _context.Submissions.Count(s => s.AssignmentId == a.Id)
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 4. GET: api/Admin/all-submissions
    [HttpGet("all-submissions")]
    public async Task<IActionResult> GetAllSubmissions()
    {
        var submissions = await _context.Submissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Select(s => new
            {
                s.Id,
                StudentName = s.Student != null ? s.Student.FullName : "Unknown Student",
                AssignmentTitle = s.Assignment != null ? s.Assignment.Title : "N/A",
                s.SubmittedAt,
                Grade = "Submitted",
                s.Feedback
            })
            .ToListAsync();

        return Ok(submissions);
    }

    // 5. POST: api/Admin/classes (Add New Class/Course)
    [HttpPost("classes")]
    public async Task<IActionResult> AddClassGroup([FromBody] ClassGroupDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Class name is required." });

        var classGroup = new ClassGroup { Name = dto.Name };
        _context.ClassGroups.Add(classGroup);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Class added successfully!", classGroup });
    }

    // 6. DELETE: api/Admin/classes/{id}
    [HttpDelete("classes/{id}")]
    public async Task<IActionResult> DeleteClassGroup(int id)
    {
        var classGroup = await _context.ClassGroups.FindAsync(id);
        if (classGroup == null) return NotFound(new { message = "Class not found." });

        _context.ClassGroups.Remove(classGroup);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Class deleted successfully." });
    }

    // 7. POST: api/Admin/change-password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) 
            return Unauthorized(new { message = "Unauthorized request." });

        int userId = int.Parse(userIdClaim);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        if (user.PasswordHash != dto.CurrentPassword) 
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = dto.NewPassword; 
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully!" });
    }

    // 8. DELETE: api/Admin/users/{id}
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }

    // 9. POST: api/Admin/subjects
    [HttpPost("subjects")]
    public async Task<IActionResult> AddSubject([FromBody] SubjectDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Subject name is required." });

        if (dto.ClassGroupId <= 0)
            return BadRequest(new { message = "Valid ClassGroupId is required." });

        var subject = new Subject 
        { 
            Name = dto.Name,
            ClassGroupId = dto.ClassGroupId
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Subject added successfully!", subject });
    }

    // 10. DELETE: api/Admin/subjects/{id}
    [HttpDelete("subjects/{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return NotFound(new { message = "Subject not found." });

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Subject deleted successfully." });
    }

    // 11. POST: api/Admin/assign-teacher
    [HttpPost("assign-teacher")]
    public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
    {
        var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TeacherId);
        if (teacher == null) return NotFound(new { message = "Teacher/User not found." });

        var subject = await _context.Subjects.FindAsync(dto.SubjectId);
        if (subject == null) return NotFound(new { message = "Subject not found." });

        var assignment = new TeacherAssignment
        {
            TeacherId = dto.TeacherId,
            SubjectId = dto.SubjectId,
            ClassName = dto.ClassName
        };

        _context.TeacherAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Teacher assigned successfully!" });
    }

    // 12. GET: api/Admin/teacher-assignments
    [HttpGet("teacher-assignments")]
    public async Task<IActionResult> GetTeacherAssignments()
    {
        var assignments = await _context.TeacherAssignments
            .Include(ta => ta.Teacher)
            .Include(ta => ta.Subject)
            .Select(ta => new
            {
                ta.Id,
                TeacherName = ta.Teacher != null ? ta.Teacher.FullName : "Unknown",
                SubjectName = ta.Subject != null ? ta.Subject.Name : "Unknown",
                ta.ClassName,
                ta.AssignedAt
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 13. PUT: api/Admin/users/{id}/role
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) 
            return NotFound(new { message = "User not found." });

        user.Role = dto.Role;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User role updated successfully!", user = new { user.Id, user.FullName, user.Email, user.Role } });
    }
}

#region DTOs
public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ClassGroupDto
{
    public string Name { get; set; } = string.Empty;
}

public class AssignTeacherDto
{
    public int TeacherId { get; set; }
    public int SubjectId { get; set; }
    public string ClassName { get; set; } = string.Empty;
}

public class SubjectDto
{
    public string Name { get; set; } = string.Empty;
    public int ClassGroupId { get; set; }
}

public class UpdateRoleDto
{
    public UserRole Role { get; set; }
}
#endregion