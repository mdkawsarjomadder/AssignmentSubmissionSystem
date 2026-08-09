'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';

 interface Subject {
  id: number;
  name: string;
}

interface Assignment {
 id: number;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  subjectId: number;
}

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  content: string;
  marksObtained: number | null;
  feedback: string;
  status: string;
}

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  
 // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // New Assignment Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newSubjectId, setNewSubjectId] = useState<number | "">("");

  // Grading Form State
  const [marksObtained, setMarksObtained] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

 useEffect(() => {
    fetchInitialData();
  }, []);

const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [subRes, assignRes] = await Promise.all([
        axios.get("http://localhost:5074/api/Submissions/subjects", config),
        axios.get("http://localhost:5074/api/Assignments", config),
      ]);

      setSubjects(subRes.data || []);
      setAssignments(assignRes.data || []);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };


  // নির্দিষ্ট Assignment-এর Submissions ডাটা লোড করা
  const handleSelectAssignment = async (assignmentId: number) => {
    try {
      setSelectedAssignmentId(assignmentId);
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5074/api/Submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };


      // ১. নতুন Assignment তৈরি করা
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        maxMarks: Number(newMaxMarks),
        subjectId: Number(newSubjectId),
      };

      await axios.post("http://localhost:5074/api/Assignments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!");
      setShowCreateModal(false);
      fetchInitialData(); // রিফ্রেশ
    } catch (err) {
      alert("অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে।");
    }
  };

  / ২. Submission Grade / 
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        marksObtained: Number(marksObtained),
        feedback: feedback,
      };

      await axios.put(`http://localhost:5074/api/Submissions/${selectedSubmission.id}/grade`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("মার্কস ও ফিডব্যাক সফলভাবে সেভ হয়েছে!");
      setSelectedSubmission(null);
      if (selectedAssignmentId) handleSelectAssignment(selectedAssignmentId); // রিলোড সাবমিশন
    } catch (err: any) {
      alert(err.response?.data || "গ্রেড করতে সমস্যা হয়েছে।");
    }
  };

 const formatDate = (dateString: any) => {
  if (!dateString) return "No Due Date";
  
  const parsedDate = new Date(dateString);
  
  // 🔴 1/1/1 বা invalid তারিখ চেক করা
  if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1) {
    return "No Due Date";
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }); // আউটপুট দেখাবে: "3 Mar 2026"
};

 return (
  // 🔴 ১. পুরো পেজের ব্যাকগ্রাউন্ড কালার ডার্ক করার জন্য min-h-screen bg-slate-950 যুক্ত করা হলো
  <div className="min-h-screen bg-slate-950 text-white p-6">
    <div className="max-w-7xl mx-auto">
      
      {/* ...Header & Buttons... */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-lg mb-4 text-slate-200">
            Assignments ({assignments.length})
          </h2>
          <div className="space-y-3">
            {assignments.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleSelectAssignment(item.id)}
                className={`p-3.5 rounded-lg border transition cursor-pointer ${
                  selectedAssignmentId === item.id
                    ? "bg-indigo-950/40 border-indigo-500"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <h3 className="font-semibold text-sm">{item.title}</h3>
                
                {/* 🔴 ২. Safe Date Checker দিয়ে Due Date আপডেট করুন */}
                <p className="text-slate-400 text-xs mt-1">
                  Due: {formatDate(item.dueDate || item.dueDateObj || item.deadline)}
                </p>
                
                <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Max Marks: {item.maxMarks}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ...Submissions Part... */}

      </div>
    </div>
  </div>
);
}

