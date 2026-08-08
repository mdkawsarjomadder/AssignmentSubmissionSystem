using AssignmentManagement.API.Entities;

namespace AssignmentManagement.API.Data;

public static class DbSeeder
{
    public static void SeedData(AppDbContext context)
    {
        // 1. Create Demo Users if not exists
        if (!context.Users.Any())
        {
            var admin = new User
            {
                FullName = "System Admin",
                Email = "admin@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin
            };

            var teacher = new User
            {
                FullName = "John Teacher",
                Email = "teacher@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
                Role = UserRole.Teacher
            };

            var student = new User
            {
                FullName = "Alice Student",
                Email = "student@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                Role = UserRole.Student
            };

            context.Users.AddRange(admin, teacher, student);
            context.SaveChanges();
        }

        // 2. Create Demo Class & Subject
        if (!context.ClassGroups.Any())
        {
            var teacher = context.Users.FirstOrDefault(u => u.Role == UserRole.Teacher);
            var student = context.Users.FirstOrDefault(u => u.Role == UserRole.Student);

            var classGroup = new ClassGroup
            {
                Name = "Class 10 - Section A"
            };

            context.ClassGroups.Add(classGroup);
            context.SaveChanges();

            if (student != null)
            {
                student.ClassGroupId = classGroup.Id;
                context.SaveChanges();
            }

            var subject = new Subject
            {
                Name = "Mathematics",
                ClassGroupId = classGroup.Id,
                TeacherId = teacher?.Id
            };

            context.Subjects.Add(subject);
            context.SaveChanges();
        }
    }
}