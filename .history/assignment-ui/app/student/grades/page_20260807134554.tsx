'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';

interface SubmissionGrade {
  id: number;
  assignmentTitle: string;
  subjectName?: string;
  submittedAt: string;
  content: string;
  marksObtained?: number | null;
  maxMarks: number;
  feedback?: string | null;
  status: 'Graded' | 'Pending';
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<SubmissionGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Submissions/my-grades', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setGrades(data);
        setError('');
      } else {
        setGrades([]);
      }
    } catch (err: any) {
      console.error('Failed to load grades:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'গ্রেড এবং ফিডব্যাক লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">My Grades & Feedback</h1>
            <p className="text-slate-400 mt-1">Review your submitted assignments, marks, and teacher remarks.</p>
          </div>
          <Link
            href="/student/dashboard"
            className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-900 rounded-lg text-sm font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            Loading your grades...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 bg-slate-900 rounded-xl border border-slate-800">
            {error}
          </div>
        ) : grades.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            You haven't submitted any assignments yet.
          </div>
        ) : (
          <div className="space-y-4">
            {grades.map((item) => {
              const isGraded = item.marksObtained !== null && item.marksObtained !== undefined;

              return (
                <div
                  key={item.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition"
                >
                  {/* Left Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs font-semibold">
                        {item.subjectName || 'General'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Submitted: {formatDate(item.submittedAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white">{item.assignmentTitle}</h3>

                    {/* Submission Content Preview */}
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      <span className="text-slate-500 font-semibold block">Your Submission:</span>
                      <p className="line-clamp-2 whitespace-pre-wrap">{item.content}</p>
                    </div>

                    {/* Teacher Feedback */}
                    {item.feedback && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-300">
                        <span className="font-semibold block mb-0.5">Teacher's Feedback:</span>
                        {item.feedback}
                      </div>
                    )}
                  </div>

                  {/* Right Marks Badge */}
                  <div className="flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        isGraded
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isGraded ? 'Graded' : 'Pending Review'}
                    </span>

                    <div className="text-right mt-auto">
                      <p className="text-xs text-slate-400">Score</p>
                      <p className="text-2xl font-bold text-white">
                        {isGraded ? (
                          <>
                            <span className="text-emerald-400">{item.marksObtained}</span>
                            <span className="text-slate-500 text-sm"> / {item.maxMarks}</span>
                          </>
                        ) : (
                          <span className="text-slate-500 text-base">-- / {item.maxMarks}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}