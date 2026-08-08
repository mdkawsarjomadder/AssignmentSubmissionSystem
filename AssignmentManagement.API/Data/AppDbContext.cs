using AssignmentManagement.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ClassGroup> ClassGroups => Set<ClassGroup>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Subject -> Teacher relationship (Nullable)
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Teacher)
            .WithMany()
            .HasForeignKey(s => s.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> ClassGroup relationship (Nullable)
        modelBuilder.Entity<User>()
            .HasOne(u => u.ClassGroup)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.ClassGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        // Foreign Key delete behaviors
        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.CreatedBy)
            .WithMany()
            .HasForeignKey(a => a.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Student)
            .WithMany()
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(s => s.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Decimal Precision Setup
        modelBuilder.Entity<Assignment>()
            .Property(a => a.MaxMarks)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Submission>()
            .Property(s => s.MarksObtained)
            .HasPrecision(18, 2);
    }
}