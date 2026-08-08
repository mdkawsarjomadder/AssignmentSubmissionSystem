using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AssignmentManagement.API.DTOs
{
    public class CreateSubmissionDto
    {
        public int AssignmentId { get; set; }
        public string AnswerContent { get; set; } = string.Empty;
    }
}