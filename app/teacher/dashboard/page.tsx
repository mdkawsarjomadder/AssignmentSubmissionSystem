'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';

interface Assignment {
  id: number;
  title: string;
  maxMarks: number;
  subjectName?: string;
}

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  content: string;
  marksObtained?: number;
  feedback?: string;
  status?: string;
}

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState('');

  // Grade Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // 1. Fetch All Assignments Created by Teacher
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setAssignments(data);
        setSelectedAssignmentId(data[0].id); // Auto-select first assignment
        fetchSubmissionsByAssignment(data[0].id);
      } else {
        setAssignments([]);
        setLoadingAssignments(false);
      }
    } catch (err: any) {
      console.error('Failed to load assignments', err);
      setError('অ্যাসাইনমেন্ট লিস্ট লোড করতে সমস্যা হয়েছে।');
      setLoadingAssignments(false);
    }
  };

  // 2. Fetch Submissions for Selected Assignment
  const fetchSubmissionsByAssignment = async (assignmentId: number) => {
    setLoadingSubmissions(true);
    setError('');
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5074/api/Submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.submissions || [];
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load submissions', err);
      if (err.response?.status === 403) {
        setError('অ্যাক্সেস মেলেনি (403)। Teacher হিসেবে পুনরায় লগইন করুন।');
      } else {
        setError('সাবমিশন লোড করতে সমস্যা হয়েছে। Backend Server চালু আছে কি না পরীক্ষা করুন।');
      }
    } finally {
      setLoadingAssignments(false);
      setLoadingSubmissions(false);
    }
  };

  // Assignment Dropdown Change Handler
  const handleAssignmentChange = (id: number) => {
    setSelectedAssignmentId(id);
    fetchSubmissionsByAssignment(id);
  };

  // Grade Submission Handler
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSubmittingGrade(true);

    try {
      const token = getAuthToken() || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5074/api/Submissions/${selectedSubmission.id}/grade`,
        { marksObtained: marks, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('গ্রেড সফলভাবে আপডেট হয়েছে!');
      setSelectedSubmission(null);
      if (selectedAssignmentId) {
        fetchSubmissionsByAssignment(selectedAssignmentId);
      }
    } catch (err: any) {
      alert(err.response?.data || 'গ্রেড সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage assignments and grade student submissions.</p>
          </div>
          <Link
            href="/teacher/create-assignment"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            + Create New Assignment
          </Link>
        </div>

        {/* Assignment Selector Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="text-xs font-semibold text-slate-300">Select Assignment to View Submissions:</label>
          {loadingAssignments ? (
            <p className="text-xs text-slate-400">Loading assignments...</p>
          ) : (
            <select
              value={selectedAssignmentId || ''}
              onChange={(e) => handleAssignmentChange(Number(e.target.value))}
              className="w-full sm:w-auto px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {assignments.length === 0 ? (
                <option value="">No Assignments Created Yet</option>
              ) : (
                assignments.map((a) => (
                  <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                    {a.title} (Max Marks: {a.maxMarks})
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Submissions List Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-slate-300 text-sm flex justify-between items-center">
            <span>Student Submissions</span>
            {selectedAssignmentId && (
              <span className="text-xs text-slate-500">Total: {submissions.length}</span>
            )}
          </div>

          {loadingSubmissions ? (
            <p className="p-8 text-center text-slate-400 text-sm">Loading submissions...</p>
          ) : error ? (
            <p className="p-8 text-center text-rose-400 text-sm">{error}</p>
          ) : assignments.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">কোনো অ্যাসাইনমেন্ট তৈরি করা হয়নি। নতুন অ্যাসাইনমেন্ট তৈরি করুন।</p>
          ) : submissions.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">এই অ্যাসাইনমেন্টের জন্য এখনো কোনো স্টুডেন্ট সাবমিশন আসেনি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Submitted Answer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Marks</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="font-medium text-white">{sub.studentName}</div>
                        <div className="text-xs text-slate-500">{sub.studentEmail}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-300">{sub.content}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold text-xs">
                            {sub.marksObtained}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setMarks(sub.marksObtained || 0);
                            setFeedback(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          {sub.marksObtained !== null && sub.marksObtained !== undefined ? 'Edit Grade' : 'Grade Now'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grade Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Grade Student Submission</h3>
              <p className="text-xs text-slate-400">Student: {selectedSubmission.studentName}</p>
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 max-h-32 overflow-y-auto">
                <span className="font-semibold block text-slate-400 mb-1">Submitted Answer:</span>
                {selectedSubmission.content}
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={marks}
                    onChange={(e) => setMarks(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback</label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm resize-none focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="w-1/2 py-2 border border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {submittingGrade ? 'Saving...' : 'Submit Grade'}
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