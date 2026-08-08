using System.Security.Claims;
using AssignmentManagement.API.Data;
using AssignmentManagement.API.DTOs;
using AssignmentManagement.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentResponseDto>>> GetAssignments()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Subject)
            .Include(a => a.CreatedBy)
            .Select(a => new AssignmentResponseDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Deadline = a.Deadline,
                MaxMarks = a.MaxMarks,
                IsPublished = a.IsPublished,
                SubjectId = a.SubjectId,
                SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
                CreatedBy = a.CreatedBy != null ? a.CreatedBy.FullName : "N/A"
            }).ToListAsync();

        return Ok(assignments);
    }

  [HttpPost]
[Authorize(Roles = "Teacher,Admin")]
public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
{
    var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
    if (!subjectExists)
    {
        var defaultSubject = await _context.Subjects.FirstOrDefaultAsync();
        if (defaultSubject == null)
        {
            return BadRequest("Database-এ কোনো Subject পাওয়া যায়নি।");
        }
        dto.SubjectId = defaultSubject.Id;
    }

    var assignment = new Assignment
    {
        Title = dto.Title,
        Description = dto.Description,
        MaxMarks = dto.MaxMarks,
        Deadline = dto.Deadline, // 🔴 এখানে DueDate এর পরিবর্তে Deadline ব্যবহার করুন
        SubjectId = dto.SubjectId
    };

    _context.Assignments.Add(assignment);
    await _context.SaveChangesAsync();

    return Ok("Assignment created successfully.");
}
}