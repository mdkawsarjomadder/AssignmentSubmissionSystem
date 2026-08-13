using System.Security.Claims;
using AssignmentManagement.API.Data;
using AssignmentManagement.API.DTOs;
using AssignmentManagement.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Controllers;

// DTO Class for File and Form Data Handling
public class CreateSubmissionDto
{
    public int AssignmentId { get; set; }
    public string AnswerContent { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
}

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

    // 0. GET SUBJECTS LIST
    [HttpGet("subjects")]
    [Authorize(Roles = "Teacher,Admin,Student,1,2,3")]
    public async Task<IActionResult> GetSubjects()
    {
        var subjects = await _context.Subjects
            .Select(s => new { s.Id, s.Name })
            .ToListAsync();

        return Ok(subjects);
    }

    // 0.1 GET CLASSES LIST
    [HttpGet("classes")]
    [AllowAnonymous] // ফ্রন্টএন্ড সহজে এক্সেস করার জন্য
    public IActionResult GetClasses()
    {
        var classes = new[]
        {
            new { Id = 1, Name = "Class 6" },
            new { Id = 2, Name = "Class 7" },
            new { Id = 3, Name = "Class 8" },
            new { Id = 4, Name = "Class 9" },
            new { Id = 5, Name = "Class 10" },
            new { Id = 6, Name = "Class 11" },
            new { Id = 7, Name = "Class 12" }
        };

        return Ok(classes);
    }

    // 1. GET SUBMISSIONS BY ASSIGNMENT ID (Teacher & Admin Only)
    [HttpGet("assignment/{assignmentId}")]
    [Authorize(Roles = "Teacher,Admin,1")]
    public async Task<IActionResult> GetSubmissionsByAssignment(int assignmentId)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return NotFound(new { message = "Assignment not found." });

        var submissions = await _context.Submissions
            .Where(s => s.AssignmentId == assignmentId)
            .Include(s => s.Student)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new
            {
                s.Id,
                StudentName = (!string.IsNullOrEmpty(s.Student.FullName)) 
                    ? s.Student.FullName 
                    : (s.Student.Email ?? "Student"),
                StudentEmail = s.Student.Email ?? "",
                s.SubmittedAt,
                Content = s.AnswerContent ?? "",
                s.FilePath,
                s.MarksObtained,
                Feedback = s.Feedback ?? "",
                Status = s.Status ?? "Submitted"
            })
            .ToListAsync();

        return Ok(new
        {
            id = assignment.Id,
            title = assignment.Title,
            maxMarks = assignment.MaxMarks,
            subjectName = assignment.Subject != null ? assignment.Subject.Name : "General",
            submissions = submissions
        });
    }

    // 2. GET MY GRADES (Student Only)
    [HttpGet("my-grades")]
    [Authorize(Roles = "Student,2,3")]
    public async Task<IActionResult> GetMyGrades()
    {
        var studentId = GetCurrentUserId();
        if (studentId == null) return Unauthorized("Invalid student token.");

        var myGrades = await _context.Submissions
            .Where(s => s.StudentId == studentId.Value)
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Subject)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new
            {
                s.Id,
                AssignmentTitle = s.Assignment.Title,
                SubjectName = s.Assignment.Subject != null ? s.Assignment.Subject.Name : "General",
                s.SubmittedAt,
                Content = s.AnswerContent,
                s.FilePath,
                s.MarksObtained,
                MaxMarks = s.Assignment.MaxMarks,
                Feedback = s.Feedback,
                Status = s.Status ?? "Submitted"
            })
            .ToListAsync();

        return Ok(myGrades);
    }

    // 3. POST: api/Submissions (Create / Submit Assignment)
    [HttpPost]
    [Authorize(Roles = "Student,2,3")]
    public async Task<IActionResult> CreateSubmission([FromForm] CreateSubmissionDto dto)
    {
        var studentId = GetCurrentUserId();
        if (studentId == null) return Unauthorized(new { message = "ইউজার সনাক্ত করা যায়নি।" });

        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
        if (assignment == null) return NotFound(new { message = "অ্যাসাইনমেন্ট পাওয়া যায়নি।" });

        if (assignment.Deadline < DateTime.UtcNow)
        {
            return BadRequest(new { message = "অ্যাসাইনমেন্টের ডেডলাইন শেষ হয়ে গেছে।" });
        }

        var existingSubmission = await _context.Submissions
            .AnyAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId.Value);

        if (existingSubmission)
        {
            return BadRequest(new { message = "আপনি ইতিমধ্যে এটি সাবমিট করেছেন। প্রয়োজনে এডিট করুন।" });
        }

        // Handle File Upload
        string? filePath = null;
        if (dto.File != null && dto.File.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.File.FileName;
            var fullPath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }
            filePath = $"/uploads/{uniqueFileName}";
        }

        var submission = new Submission
        {
            AssignmentId = dto.AssignmentId,
            StudentId = studentId.Value,
            AnswerContent = dto.AnswerContent ?? string.Empty,
            FilePath = filePath,
            SubmittedAt = DateTime.UtcNow,
            Status = "Submitted"
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Assignment submitted successfully!" });
    }

    // 4. PUT: api/Submissions (Update / Resubmit Assignment)
    [HttpPut]
    [Authorize(Roles = "Student,2,3")]
    public async Task<IActionResult> UpdateSubmission([FromForm] CreateSubmissionDto dto)
    {
        var studentId = GetCurrentUserId();
        if (studentId == null) return Unauthorized(new { message = "ইউজার সনাক্ত করা যায়নি।" });

        var existingSubmission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId.Value);

        if (existingSubmission == null)
        {
            return NotFound(new { message = "পূর্বে কোনো সাবমিশন পাওয়া যায়নি।" });
        }

        if (existingSubmission.Assignment != null && existingSubmission.Assignment.Deadline < DateTime.UtcNow)
        {
            return BadRequest(new { message = "অ্যাসাইনমেন্টের ডেডলাইন শেষ হয়ে গেছে, উত্তর পরিবর্তন সম্ভব নয়।" });
        }

        existingSubmission.AnswerContent = dto.AnswerContent ?? string.Empty;
        existingSubmission.SubmittedAt = DateTime.UtcNow;

        if (dto.File != null && dto.File.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.File.FileName;
            var fullPath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            existingSubmission.FilePath = $"/uploads/{uniqueFileName}";
        }

        _context.Submissions.Update(existingSubmission);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Submission updated successfully!" });
    }

    // 5. GRADE SUBMISSION (Teacher & Admin Only)
    [HttpPut("{id}/grade")]
    [Authorize(Roles = "Teacher,Admin,1")]
    public async Task<IActionResult> GradeSubmission([FromRoute] int id, [FromBody] GradeSubmissionDto dto)
    {
        if (dto == null) return BadRequest("Invalid data provided.");

        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null) return NotFound("Submission not found.");

        if (dto.MarksObtained > submission.Assignment.MaxMarks)
        {
            return BadRequest($"Marks cannot exceed maximum limit of {submission.Assignment.MaxMarks}.");
        }

        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;
        submission.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Graded" : dto.Status;

        await _context.SaveChangesAsync();
        return Ok("Submission graded successfully.");
    }

    // 6. GET MY SUBMISSIONS (Student Only)
    [HttpGet("my-submissions")]
    [Authorize(Roles = "Student,2,3")]
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
                s.FilePath,
                s.SubmittedAt,
                s.MarksObtained,
                s.Feedback,
                Status = s.Status ?? "Submitted"
            })
            .ToListAsync();

        return Ok(submissions);
    }
}