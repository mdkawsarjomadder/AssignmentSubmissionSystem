'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import ProtectedRoute from "@/components/ProtectedRoute";

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline?: string;
  dueDate?: string;
  maxMarks: number;
  subjectName?: string;
  isSubmitted?: boolean;
}

interface GradeInfo {
  id: number;
  assignmentTitle: string;
  subjectName: string;
  submittedAt: string;
  content: string;
  marksObtained: number | null;
  maxMarks: number;
  feedback: string;
}


 function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myGrades, setMyGrades] = useState<GradeInfo[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // 🔴 Fixed: 'error' state added

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [assignmentsRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:5074/api/Assignments', config),
        axios.get('http://localhost:5074/api/Submissions/my-grades', config),
      ]);

      const gradesData: GradeInfo[] = gradesRes.data || [];
      setMyGrades(gradesData);

      const submittedTitles = new Set(gradesData.map((g) => g.assignmentTitle));

      const rawAssignments = assignmentsRes.data.data || assignmentsRes.data || [];
      const updatedAssignments = (Array.isArray(rawAssignments) ? rawAssignments : []).map(
        (a: Assignment) => ({
          ...a,
          isSubmitted: a.isSubmitted || submittedTitles.has(a.title),
        })
      );

      setAssignments(updatedAssignments);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

const formatDate = (dateString: any) => {
  if (!dateString) return "No Due Date";
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1) {
    return "No Due Date";
  }
  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setModalMessage('');

    try {
      const token = getAuthToken() || localStorage.getItem('token');

      const fullAnswer = fileUrl
        ? `${submissionContent}\n\nAttached File: ${fileUrl}`
        : submissionContent;

      const payload = {
        assignmentId: selectedAssignment.id,
        answerContent: fullAnswer,
      };

      await axios.post('http://localhost:5074/api/Submissions', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setAssignments((prev) =>
        prev.map((item) =>
          item.id === selectedAssignment.id ? { ...item, isSubmitted: true } : item
        )
      );

      setModalMessage('অ্যাসাইনমেন্ট সফলভাবে সাবমিট হয়েছে!');
      setSubmissionContent('');
      setFileUrl('');
      setTimeout(() => {
        setSelectedAssignment(null);
        setModalMessage('');
      }, 1200);
    } catch (err: any) {
      setModalMessage(
        err.response?.data?.message || err.response?.data || 'সাবমিশনে সমস্যা হয়েছে।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Search & Filter Logic
  const subjectsList = [
    'All',
    ...Array.from(new Set(assignments.map((a) => a.subjectName).filter(Boolean))),
  ];

  const filteredAssignments = assignments.filter((a) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || a.title.toLowerCase().includes(query);
    const matchesSubject = selectedSubject === 'All' || a.subjectName === selectedSubject;
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'completed'
        ? a.isSubmitted
        : !a.isSubmitted;

    return matchesSearch && matchesSubject && matchesTab;
  });

  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => a.isSubmitted).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-slate-400 mt-1">
              View available assignments, track progress, and submit work.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/grades"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
            >
              My Grades & Feedback →
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-rose-900/50 text-rose-400 hover:bg-rose-950/40 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Total Assignments</p>
              <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
            </div>
            <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg text-xl">📚</span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Pending</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</h3>
            </div>
            <span className="p-3 bg-amber-500/10 text-amber-400 rounded-lg text-xl">⏳</span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Completed</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</h3>
            </div>
            <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-xl">✅</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
            {(['all', 'pending', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Subject Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {subjectsList.length > 1 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                {subjectsList.map((subject) => (
                  <option key={subject} value={subject}>
                    Subject: {subject}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Cards Section */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            Loading assignments...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-slate-900 rounded-xl border border-slate-800">
            {error}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            No assignments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const due = assignment.deadline || assignment.dueDate;
              const overdue = !assignment.isSubmitted && isOverdue(due);
              const gradeInfo = myGrades.find((g) => g.assignmentTitle === assignment.title);

              return (
                <div
                  key={assignment.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs font-semibold">
                        {assignment.subjectName || 'General'}
                      </span>

                      {assignment.isSubmitted ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold">
                          ✓ Submitted
                        </span>
                      ) : overdue ? (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-xs font-semibold">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{assignment.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Max Marks: {assignment.maxMarks}</span>
                      <span className={overdue ? 'text-rose-400 font-semibold' : ''}>
                        Due: {formatDate(due)}
                      </span>
                    </div>

                    {assignment.isSubmitted ? (
                      gradeInfo ? (
                        <button
                          onClick={() => setSelectedGrade(gradeInfo)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          View Result / Feedback
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-800 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-700"
                        >
                          Already Submitted
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Submit: {selectedAssignment.title}</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalMessage && (
                <div className="p-3 bg-slate-800 text-indigo-300 text-xs rounded-xl border border-indigo-900">
                  {modalMessage}
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Solution Text / Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Write your main answer or explanation here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Attachment Link (Google Drive / GitHub / File URL)
                  </label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/your-file-link"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="w-1/2 py-2.5 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Confirm Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Grade & Feedback Modal */}
        {selectedGrade && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Submission Details</h3>
                <button
                  onClick={() => setSelectedGrade(null)}
                  className="text-slate-400 hover:text-white text-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Assignment Title</span>
                  <p className="font-semibold text-base">{selectedGrade.assignmentTitle}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-xs">Your Answer</span>
                  <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 mt-1 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedGrade.content || 'No text provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400 block text-xs">Obtained Marks</span>
                    <p className="text-lg font-bold text-emerald-400">
                      {selectedGrade.marksObtained !== null
                        ? `${selectedGrade.marksObtained} / ${selectedGrade.maxMarks}`
                        : 'Not Graded Yet'}
                    </p>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400 block text-xs">Submitted At</span>
                    <p className="text-xs text-slate-300 mt-1">
                      {new Date(selectedGrade.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedGrade.feedback && (
                  <div className="pt-2">
                    <span className="text-slate-400 block text-xs">Teacher's Feedback</span>
                    <p className="bg-indigo-950/40 border border-indigo-800/50 p-3 rounded-lg text-indigo-200 mt-1">
                      💬 {selectedGrade.feedback}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedGrade(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRole="Student">
      <StudentDashboard />
    </ProtectedRoute>
  );
}