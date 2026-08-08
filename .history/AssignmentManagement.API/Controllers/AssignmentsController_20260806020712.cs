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
    public async Task<ActionResult<AssignmentResponseDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var assignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.Deadline,
            MaxMarks = dto.MaxMarks,
            SubjectId = dto.SubjectId,
            CreatedById = int.Parse(userIdStr),
            IsPublished = true
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(assignment);
    }
}