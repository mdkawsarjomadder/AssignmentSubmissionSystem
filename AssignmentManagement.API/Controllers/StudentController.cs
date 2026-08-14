using AssignmentManagement.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // লগইন করা যেকোনো ইউজার এক্সেস করতে পারবে
public class StudentController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentController(AppDbContext context)
    {
        _context = context;
    }

    // 1. GET: api/Student/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetStudentDashboardData()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Subject)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                a.Deadline,
                a.MaxMarks,
                SubjectName = a.Subject != null ? a.Subject.Name : "General",
                // এই অ্যাসাইনমেন্টে বর্তমান স্টুডেন্ট সাবমিট করেছে কিনা
                IsSubmitted = _context.Submissions.Any(s => s.AssignmentId == a.Id)
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 2. GET: api/Student/my-grades
    [HttpGet("my-grades")]
    public async Task<IActionResult> GetMyGrades()
    {
        // JWT Token থেকে বর্তমান স্টুডেন্টের Id নেওয়া
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { message = "Unauthorized access." });
        }

        int studentId = int.Parse(userIdClaim);

        var grades = await _context.Submissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Subject)
            .Where(s => s.StudentId == studentId)
            .Select(s => new
            {
                s.Id,
                AssignmentTitle = s.Assignment.Title,
                SubjectName = s.Assignment.Subject != null ? s.Assignment.Subject.Name : "General",
                SubmittedAt = s.SubmittedAt,
                Content = s.AnswerContent,
                MarksObtained = s.MarksObtained,
                MaxMarks = s.Assignment.MaxMarks,
                Feedback = s.Feedback ?? "No feedback provided yet."
            })
            .ToListAsync();

        return Ok(grades);
    }
}