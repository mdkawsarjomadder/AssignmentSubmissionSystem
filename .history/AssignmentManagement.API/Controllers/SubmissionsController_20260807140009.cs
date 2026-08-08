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
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubmissionsController(AppDbContext context)
    {
        _context = context;
    }

    // 🔴 Helper Method: Token থেকে Safe-ভাবে User ID পাওয়ার জন্য
    private int? GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                     ?? User.FindFirst("sub")?.Value 
                     ?? User.FindFirst("id")?.Value;

        if (int.TryParse(userIdStr, out int userId))
        {
            return userId;
        }

        return null;
    }

    // 1. GET ALL SUBMISSIONS (Teacher & Admin Only)
[HttpGet("my-grades")]
[Authorize(Roles = "Student")]
public async Task<IActionResult> GetMyGrades()
{
    var userIdStr = User.FindFirst("sub")?.Value 
                 ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (!int.TryParse(userIdStr, out int studentId))
        return Unauthorized("Invalid student token.");

    var myGrades = await _context.Submissions
        .Where(s => s.StudentId == studentId)
        .Include(s => s.Assignment)
        .ThenInclude(a => a.Subject)
        .OrderByDescending(s => s.SubmittedAt)
        .Select(s => new
        {
            s.Id,
            AssignmentTitle = s.Assignment.Title,
            SubjectName = s.Assignment.Subject != null ? s.Assignment.Subject.Name : "General",
            s.SubmittedAt,
            Content = s.AnswerContent, // 🔴 s.Content এর জায়গায় s.AnswerContent ব্যবহার করা হয়েছে
            s.MarksObtained,
            MaxMarks = s.Assignment.MaxMarks,
            s.Feedback
        })
        .ToListAsync();

    return Ok(myGrades);
}

    // 2. SUBMIT ASSIGNMENT (Student Only)
    [HttpPost]
    [Authorize(Roles = "Student,2")]
    public async Task<IActionResult> SubmitAssignment([FromBody] SubmitAssignmentDto dto)
    {
        var studentId = GetCurrentUserId();
        if (studentId == null) return Unauthorized("Invalid token user identifier.");

        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
        if (assignment == null) return NotFound("Assignment not found.");

        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId.Value);

        if (existingSubmission != null)
            return BadRequest("You have already submitted this assignment.");

        var submission = new Submission
        {
            AssignmentId = dto.AssignmentId,
            StudentId = studentId.Value,
            AnswerContent = dto.AnswerContent,
            SubmittedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok("Assignment submitted successfully.");
    }

    // 3. GRADE SUBMISSION (Teacher & Admin Only)
// 3. GRADE SUBMISSION (Teacher & Admin Only)
    [HttpPut("{id}/grade")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GradeSubmission([FromRoute] int id, [FromBody] GradeSubmissionDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Invalid data provided.");
        }
        // 🔴 Edit 1: FindAsync-এর বদলে Include করে Assignment লোড করা হলো
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (submission == null) return NotFound("Submission not found.");
        // 🔴 Edit 2: MaxMarks ভ্যালিডেশন
        if (dto.MarksObtained > submission.Assignment.MaxMarks)
        {
            return BadRequest($"Marks cannot exceed the maximum limit of {submission.Assignment.MaxMarks}.");
        }
        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;
        submission.Status = "Graded"; // 🔴 Edit 3: স্ট্যাটাস আপডেট

        await _context.SaveChangesAsync();
        return Ok("Submission graded successfully.");
    }

    // 4. GET MY SUBMISSIONS (Student Only)
    [HttpGet("my-submissions")]
    [Authorize(Roles = "Student,2")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var studentId = GetCurrentUserId();
        if (studentId == null) return Unauthorized("Invalid token user identifier.");

        var submissions = await _context.Submissions
            .Where(s => s.StudentId == studentId.Value)
            .Include(s => s.Assignment)
            .Select(s => new
            {
                s.Id,
                s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                MaxMarks = s.Assignment.MaxMarks,
                Content = s.AnswerContent,
                s.SubmittedAt,
                s.MarksObtained,
                s.Feedback
            })
            .ToListAsync();

        return Ok(submissions);
    }
}