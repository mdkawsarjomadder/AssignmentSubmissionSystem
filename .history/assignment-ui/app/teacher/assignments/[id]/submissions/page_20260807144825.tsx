'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';

interface Submission {
  id: number;
  studentName?: string;
  studentEmail?: string;
  submittedAt: string;
  content: string;
  marksObtained?: number | null;
  feedback?: string | null;
  status: string;
}

interface AssignmentDetails {
  id: number;
  title: string;
  maxMarks: number;
  subjectName?: string;
}

export default function TeacherSubmissionsPage() {
  const params = useParams();
  const assignmentId = params.id;

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Grading Modal/State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marksInput, setMarksInput] = useState<number | ''>('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeMessage, setGradeMessage] = useState('');

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentAndSubmissions();
    }
  }, [assignmentId]);

  const fetchAssignmentAndSubmissions = async () => {
    setLoading(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      
      // Fetch Submissions for this assignment
      const res = await axios.get(`http://localhost:5074/api/Submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setSubmissions(data);
      } else if (data.submissions) {
        setSubmissions(data.submissions);
        setAssignment({
          id: data.id,
          title: data.title,
          maxMarks: data.maxMarks,
          subjectName: data.subjectName,
        });
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      setError(err.response?.data?.message || 'সাবমিশন ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setMarksInput(sub.marksObtained !== null && sub.marksObtained !== undefined ? sub.marksObtained : '');
    setFeedbackInput(sub.feedback || '');
    setGradeMessage('');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmittingGrade(true);
    setGradeMessage('');

    try {
      const token = getAuthToken() || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5074/api/Submissions/${selectedSubmission.id}/grade`,
        {
          marksObtained: Number(marksInput),
          feedback: feedbackInput,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGradeMessage('সফলভাবে গ্রেড দেওয়া হয়েছে!');

      // Update Local State
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSubmission.id
            ? {
                ...item,
                marksObtained: Number(marksInput),
                feedback: feedbackInput,
                status: 'Graded',
              }
            : item
        )
      );

      setTimeout(() => {
        setSelectedSubmission(null);
        setGradeMessage('');
      }, 1000);
    } catch (err: any) {
      setGradeMessage(err.response?.data || err.response?.data?.message || 'গ্রেড জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const formatDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
              Submissions Review
            </span>
            <h1 className="text-3xl font-bold mt-1">
              {assignment?.title || `Assignment #${assignmentId}`}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review student answers, attached files, and assign grades.
            </p>
          </div>
          <Link
            href="/teacher/dashboard"
            className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-900 rounded-lg text-sm font-medium transition"
          >
            ← Back to Teacher Dashboard
          </Link>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            Loading student submissions...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 bg-slate-900 rounded-xl border border-slate-800">
            {error}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            No students have submitted answers for this assignment yet.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const isGraded = sub.marksObtained !== null && sub.marksObtained !== undefined;

              return (
                <div
                  key={sub.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition"
                >
                  {/* Left Side: Submission Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">
                        {sub.studentName || 'Student'}
                      </span>
                      {sub.studentEmail && (
                        <span className="text-xs text-slate-500">({sub.studentEmail})</span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto md:ml-0">
                        Submitted: {formatDate(sub.submittedAt)}
                      </span>
                    </div>

                    {/* Answer Content */}
                    <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="text-slate-500 font-semibold block">Answer / Content:</span>
                      <p className="whitespace-pre-wrap">{sub.content}</p>
                    </div>

                    {/* Existing Feedback */}
                    {sub.feedback && (
                      <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs text-indigo-300">
                        <span className="font-semibold block mb-0.5">Teacher Feedback:</span>
                        {sub.feedback}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Score & Action Button */}
                  <div className="flex md:flex-col justify-between items-end gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        isGraded
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isGraded ? 'Graded' : 'Pending Review'}
                    </span>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Score</p>
                      <p className="text-2xl font-bold text-white">
                        {isGraded ? (
                          <span className="text-emerald-400">{sub.marksObtained}</span>
                        ) : (
                          <span className="text-slate-500 text-base">--</span>
                        )}
                        <span className="text-slate-500 text-sm">
                          {' '}
                          / {assignment?.maxMarks || 100}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => openGradeModal(sub)}
                      className="mt-2 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      {isGraded ? 'Update Grade' : 'Grade Assignment'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grading Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">
                  Grade Submission: {selectedSubmission.studentName || 'Student'}
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {gradeMessage && (
                <div className="p-3 bg-slate-800 text-indigo-300 text-xs rounded-xl border border-indigo-900">
                  {gradeMessage}
                </div>
              )}

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Marks Obtained (Max: {assignment?.maxMarks || 100})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={assignment?.maxMarks || 100}
                    value={marksInput}
                    onChange={(e) => setMarksInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter marks"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Feedback / Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Write constructive feedback for the student..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="w-1/2 py-2.5 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                  >
                    {submittingGrade ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}