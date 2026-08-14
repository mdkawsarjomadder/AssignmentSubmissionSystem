'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myGrades, setMyGrades] = useState<GradeInfo[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Submit & Edit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken() || localStorage.getItem("token");

      if (!token) {
       setError("Token not found! Please log in again.");
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // (Promise.all)
      const [assignmentsRes, gradesRes] = await Promise.allSettled([
        axios.get("http://localhost:5074/api/Student/dashboard", { headers }),
        axios.get("http://localhost:5074/api/Student/my-grades", { headers }) // আপনার ব্যাকএন্ডে গ্রেড এন্ডপয়েন্ট থাকলে
      ]);

      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.data || []);
      } else {
        throw assignmentsRes.reason;
      }

      if (gradesRes.status === 'fulfilled') {
        setMyGrades(gradesRes.value.data || []);
      }

    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);

        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      setError("Could not connect to the server! Please make sure the backend is running and CORS support is enabled.");
    } else if (err.response?.status === 404) {
      setError("API endpoint not found (404 Not Found). Please check the backend URL.");
    } else if (err.response) {
      const serverMessage = typeof err.response.data === "string" ? err.response.data : err.response.data?.message;
      setError(serverMessage || `Server Error: ${err.response.status}`);
    } else {
    setError("An unknown error occurred while loading data.");      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "No Due Date";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1970) {
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
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1970) {
      return false;
    }
    return parsedDate < new Date();
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
     setModalMessage('error:File size must not exceed 5MB!');
        return;
      }
      setSelectedFile(file);
      setModalMessage('');
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!submissionContent.trim()) {
     setModalMessage('error:Please provide an answer!');
      return;
    }

    const due = selectedAssignment.dueDate || selectedAssignment.deadline;
    if (isOverdue(due)) {
   setModalMessage('error:Sorry, the deadline for this assignment has passed.');      return;
    }

    setSubmitting(true);
    setModalMessage('');

    try {
      const token = getAuthToken() || localStorage.getItem('token');

      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment.id.toString());
      formData.append('answerContent', submissionContent);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (isEditing) {
        response = await axios.put('http://localhost:5074/api/Submissions', formData, config);
      } else {
        response = await axios.post('http://localhost:5074/api/Submissions', formData, config);
      }

      setModalMessage(`success:${response.data?.message || 'Assignment Submitted Successfully!'}`);

      setAssignments((prev) =>
        prev.map((item) =>
          item.id === selectedAssignment.id ? { ...item, isSubmitted: true } : item
        )
      );

      setSubmissionContent('');
      setSelectedFile(null);
      setIsEditing(false);

      setTimeout(() => {
        setSelectedAssignment(null);
        setModalMessage('');
        fetchDashboardData();
      }, 1500);

    } catch (err: any) {
      console.error('Submission Error:', err);
      let errorMsg = 'Submission Request Failed!';

      if (err.response) {
        const data = err.response.data;
        errorMsg = data?.message || data?.title || (typeof data === 'string' ? data : 'Server validation error');
      } else if (err.request) {
        errorMsg = 'Cannot connect to backend server!';
      } else {
        errorMsg = err.message || 'An unexpected error occurred.';
      }

      setModalMessage(`error:${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResubmit = (assignment: Assignment, existingGrade?: GradeInfo) => {
    setSelectedAssignment(assignment);
    setIsEditing(true);
    setSubmissionContent(existingGrade?.content || '');
    setModalMessage('');
  };

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

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

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

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <Link
                href="/student/profile"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition"
              >
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-rose-900/50 text-rose-400 hover:bg-rose-950/40 rounded-lg text-sm font-medium transition cursor-pointer"
              >
                Logout
              </button>
            </div>
            <div>
              <Link
                href="/student/grades"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition block"
              >
                My Grades & Feedback →
              </Link>
            </div>
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

        {/* Main Section */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <div className="animate-spin text-3xl">⏳</div>
            <p className="text-sm">Loading assignments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-slate-900 rounded-2xl border border-slate-800">
            {error}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center border border-slate-700/50">
              <span className="text-4xl">📂</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-200">No Assignments Found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                There are no assignments matching your current filter criteria or search query.
              </p>
            </div>
            {(searchQuery || selectedSubject !== 'All' || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                  setActiveTab('all');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-semibold border border-slate-700 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAssignments.map((assignment) => {
                const due = assignment.dueDate || assignment.deadline;
                const overdue = isOverdue(due);
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

                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Max Marks: {assignment.maxMarks}</span>
                        <span className={overdue ? 'text-rose-400 font-semibold' : ''}>
                          Due: {formatDate(due)}
                        </span>
                      </div>

                      {assignment.isSubmitted ? (
                        <div className="space-y-2">
                          {gradeInfo && (
                            <button
                              onClick={() => setSelectedGrade(gradeInfo)}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-medium transition cursor-pointer"
                            >
                              View Result / Feedback
                            </button>
                          )}

                          {!overdue ? (
                            <button
                              onClick={() => handleOpenResubmit(assignment, gradeInfo)}
                              className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition cursor-pointer"
                            >
                              ✏️ Edit / Resubmit Work
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full py-2 bg-slate-800/50 text-slate-500 rounded-lg text-xs font-medium cursor-not-allowed border border-slate-800"
                            >
                              Submission Closed (Overdue)
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsEditing(false);
                            setSubmissionContent('');
                          }}
                          disabled={overdue}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {overdue ? 'Deadline Passed' : 'Submit Assignment'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-white">
                    {Math.min(startIndex + itemsPerPage, filteredAssignments.length)}
                  </span>{' '}
                  of <span className="font-semibold text-white">{filteredAssignments.length}</span> assignments
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  <span className="text-xs font-semibold text-slate-400 px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit / Resubmit Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">
                  {isEditing ? 'Resubmit Work:' : 'Submit Work:'} {selectedAssignment.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setModalMessage('');
                    setSelectedFile(null);
                    setIsEditing(false);
                  }}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalMessage && (
                <div
                  className={`p-3 text-xs font-semibold rounded-xl border flex items-center gap-2 ${
                    modalMessage.startsWith('success:')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <span>{modalMessage.startsWith('success:') ? '✅' : '❌'}</span>
                  <span>{modalMessage.replace(/^(success:|error:)/, '')}</span>
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Solution Text / Details
                  </label>
                  <textarea
                    rows={4}
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Write your main answer or explanation here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Attach File / Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-1"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-emerald-400 mt-1">
                      📎 Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssignment(null);
                      setModalMessage('');
                      setSelectedFile(null);
                      setIsEditing(false);
                    }}
                    className="w-1/2 py-2.5 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-1/2 py-2.5 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition cursor-pointer ${
                      isEditing ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {submitting ? 'Updating...' : isEditing ? 'Confirm Resubmit' : 'Confirm Submit'}
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