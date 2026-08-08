'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getAuthToken, removeAuthToken } from '@/lib/auth';

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline?: string;
  dueDate?: string;
  maxMarks: number;
  subjectName?: string;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Assignments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setAssignments(data);
        setError('');
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error('Failed to load assignments:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('অনুমতি নেই। অনুগ্রহ করে পুনরায় লগইন করুন।');
      } else if (err.response?.status === 403) {
        setError('অ্যাক্সেস মেলেনি (403)। Student একাউন্ট দিয়ে লগইন করুন।');
      } else {
        setError(err.response?.data?.message || err.response?.data || 'অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  // Safe Date Formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return 'No due date';

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Submit Handler
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setModalMessage('');

    try {
      const token = getAuthToken() || localStorage.getItem('token');
      
      const payload = {
        assignmentId: selectedAssignment.id,
        content: submissionContent,
      };

      await axios.post(
        'http://localhost:5074/api/Submissions',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setModalMessage('অ্যাসাইনমেন্ট সফলভাবে সাবমিট হয়েছে!');
      setSubmissionContent('');
      setTimeout(() => {
        setSelectedAssignment(null);
        setModalMessage('');
      }, 1500);
    } catch (err: any) {
      setModalMessage(err.response?.data?.message || err.response?.data || 'সাবমিশনে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-slate-400 mt-1">View available assignments and submit your work.</p>
          </div>
          <div className="flex items-left gap-3">
            {/* 🔴 Logout বাটন বামে আনা হয়েছে */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-rose-900/50 text-rose-500 hover:bg-rose-950/30 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
            <Link
              href="/student/grades"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
            >
              My Grades & Feedback →
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            Loading assignments...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-slate-900 rounded-xl border border-slate-800">
            {error}
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            No assignments available.
          </div>
        ) : (
          /* 🔴 ৩টি করে কার্ড দেখানোর জন্য lg:grid-cols-3 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{assignment.description}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Max Marks: {assignment.maxMarks}</span>
                    <span>Due: {formatDate(assignment.deadline || assignment.dueDate)}</span>
                  </div>
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Submit Assignment
                  </button>
                </div>
              </div>
            ))}
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
                  className="text-slate-400 hover:text-white transition"
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
                    Solution / Answer Link / Text
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Write your answer or paste GitHub / Google Drive link here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>
                <div className="flex gap-3">
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

      </div>
    </div>
  );
}