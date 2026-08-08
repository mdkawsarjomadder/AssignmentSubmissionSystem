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

    // 🔴 ১. এই মেথডটি মিসিং ছিল (GET ALL SUBMISSIONS)
    [HttpGet]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetAllSubmissions()
    {
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Select(s => new
            {
                s.Id,
                s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                StudentName = s.Student.FullName, // অথবা FullName / Email
                Content = s.AnswerContent,
                s.SubmittedAt,
                s.MarksObtained,
                s.Feedback
            })
            .ToListAsync();

        return Ok(submissions);
    }

    // 🟢 SUBMIT ASSIGNMENT (POST)
    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SubmitAssignment([FromBody] SubmitAssignmentDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var studentId = int.Parse(userIdStr);

        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
        if (assignment == null) return NotFound("Assignment not found.");

        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);

        if (existingSubmission != null)
            return BadRequest("You have already submitted this assignment.");

        var submission = new Submission
        {
            AssignmentId = dto.AssignmentId,
            StudentId = studentId,
            AnswerContent = dto.AnswerContent,
            SubmittedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok("Assignment submitted successfully.");
    }

    // 🔵 GRADE SUBMISSION (PUT)
    [HttpPut("{id}/grade")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GradeSubmission([FromRoute] int id, [FromBody] GradeSubmissionDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Invalid data provided.");
        }

        var submission = await _context.Submissions.FindAsync(id);
        if (submission == null) return NotFound("Submission not found.");

        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;

        await _context.SaveChangesAsync();
        return Ok("Submission graded successfully.");
    }
}