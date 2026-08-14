using AssignmentManagement.API.Data; // 👈 AppDbContext-এর জন্য
using AssignmentManagement.API.DTOs; // 👈 GradeSubmissionDto-এর জন্য
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Teacher")]
public class TeacherController : ControllerBase
{
    private readonly AppDbContext _context; // 👈 AppDbContext ব্যবহার করা হয়েছে

    public TeacherController(AppDbContext context)
    {
        _context = context;
    }

    // Logged-in Teacher's ID পাওয়ার মেথড
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out int id) ? id : 0;
    }

    // 1. GET: api/Teacher/my-assignments (টিচারের তৈরি করা অ্যাসাইনমেন্ট)
    [HttpGet("my-assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        int teacherId = GetCurrentUserId();

        var assignments = await _context.Assignments
            .Where(a => a.CreatedById == teacherId) // 👈 TeacherId এর জায়গায় CreatedById
            .Include(a => a.Subject)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                DueDate = a.Deadline, 
                SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
                SubmissionsCount = _context.Submissions.Count(s => s.AssignmentId == a.Id)
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 2. GET: api/Teacher/assigned-subjects (এডমিন টিচারকে যেসব ক্লাসে অ্যাসাইন করেছে)
    [HttpGet("assigned-subjects")]
    public async Task<IActionResult> GetMyAssignedSubjects()
    {
        int teacherId = GetCurrentUserId();

        var assignments = await _context.TeacherAssignments
            .Where(ta => ta.TeacherId == teacherId)
            .Select(ta => new
            {
                ta.SubjectId,
                SubjectName = _context.Subjects.Where(s => s.Id == ta.SubjectId).Select(s => s.Name).FirstOrDefault(),
                ta.ClassName
            })
            .ToListAsync();

        return Ok(assignments);
    }

    // 3. POST: api/Teacher/grade-submission/{submissionId} (মার্কস ও ফিডব্যাক দেওয়া)
    [HttpPost("grade-submission/{submissionId}")]
    public async Task<IActionResult> GradeSubmission(int submissionId, [FromBody] GradeSubmissionDto dto)
    {
        var submission = await _context.Submissions.FindAsync(submissionId);
        if (submission == null) return NotFound(new { message = "Submission not found." });

        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;
        submission.Status = dto.Status;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Submission graded successfully!" });
    }
}