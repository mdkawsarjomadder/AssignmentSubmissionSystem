using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.API.Data;
using AssignmentManagement.API.DTOs;
using AssignmentManagement.API.Entities;

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

    // 🔴 1. GET ALL ASSIGNMENTS (Student, Teacher, Admin সবাই এক্সেস করতে পারবে)
    [HttpGet]
    [Authorize(Roles = "Student,Teacher,Admin")]
    public async Task<IActionResult> GetAssignments()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Subject) // Subject ডাটা include করা হলো
            .OrderByDescending(a => a.Id)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                a.MaxMarks,
                Deadline = a.Deadline,
                SubjectId = a.SubjectId,
                SubjectName = a.Subject != null ? a.Subject.Name : "General"
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 🔴 2. CREATE ASSIGNMENT (শুধুমাত্র Teacher এবং Admin)
    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        // ১. Token থেকে সঠিক User ID এক্সট্র্যাক্ট করা
        var userIdStr = User.FindFirst("sub")?.Value 
                     ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int teacherId))
        {
            return Unauthorized("Invalid user token identifier.");
        }

        // ২. Teacher/User ডাটাবেজে সত্যিই আছে কিনা নিশ্চিত করা
        var userExists = await _context.Users.AnyAsync(u => u.Id == teacherId);
        if (!userExists)
        {
            return BadRequest("Logged-in user does not exist in database. Please log in again.");
        }

        // ৩. Valid SubjectId নিশ্চিত করা (না থাকলে প্রথমটি নেয়া)
        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
        if (!subjectExists)
        {
            var defaultSubject = await _context.Subjects.FirstOrDefaultAsync();
            if (defaultSubject == null)
            {
                return BadRequest("No subject found in database.");
            }
            dto.SubjectId = defaultSubject.Id;
        }

        var assignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            MaxMarks = dto.MaxMarks,
            Deadline = dto.Deadline,
            SubjectId = dto.SubjectId,
            IsPublished = dto.IsPublished,
            CreatedById = teacherId // Foreign Key
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok("Assignment created successfully.");
    }

    //GetPut:--------------------Update create 
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] CreateAssignmentDto dto)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound();

        assignment.Title = dto.Title;
        assignment.Description = dto.Description;
        assignment.Deadline = dto.Deadline; 
        assignment.MaxMarks = dto.MaxMarks;
        assignment.SubjectId = dto.SubjectId;
        assignment.IsPublished = dto.IsPublished;

        await _context.SaveChangesAsync();
        return Ok(assignment);
    }

    //Delete -----------------------|
    [HttpDelete("{id}")]
public async Task<IActionResult> DeleteAssignment(int id)
{
    var assignment = await _context.Assignments
        .Include(a => a.Submissions) // সাথে সাবমিশনগুলো অন্তর্ভুক্ত করুন
        .FirstOrDefaultAsync(a => a.Id == id);

    if (assignment == null) return NotFound();

    _context.Submissions.RemoveRange(assignment.Submissions); // আগে সাবমিশন ডিলিট
    _context.Assignments.Remove(assignment); // তারপর অ্যাসাইনমেন্ট ডিলিট
    await _context.SaveChangesAsync();

    return Ok(new { message = "Assignment deleted successfully" });
}

}