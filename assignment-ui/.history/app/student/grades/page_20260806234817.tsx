'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';

interface MySubmission {
  id: number;
  assignmentTitle: string;
  maxMarks: number;
  content: string;
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
}

export default function MyGradesPage() {
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const token = getAuthToken();

        // 1. Check if token exists
        if (!token) {
          setErrorMsg('Authentication token missing. Please log in again.');
          setLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5074/api/Submissions/my-submissions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.data || res.data;
        if (Array.isArray(data)) setSubmissions(data);
      } catch (err: any) {
        console.error('Failed to fetch my grades:', err);
        
        // 2. Handle 403 Forbidden specifically
        if (err.response?.status === 403) {
          setErrorMsg('Access denied (403). Your account does not have permission to view student grades.');
        } else if (err.response?.status === 401) {
          setErrorMsg('Session expired (401). Please log in again.');
        } else {
          setErrorMsg('Failed to load grades. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold">My Grades & Feedback</h1>
            <p className="text-sm text-slate-400 mt-1">Track your submitted assignments, scores, and teacher notes.</p>
          </div>
          <Link
            href="/student/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold hover:bg-slate-800 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl">Loading your submissions...</div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-rose-400 bg-rose-950/30 border border-rose-800/50 rounded-2xl">
            {errorMsg}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            You haven't submitted any assignments yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((sub) => {
              const isGraded = sub.marksObtained !== undefined && sub.marksObtained !== null;

              return (
                <div
                  key={sub.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{sub.assignmentTitle}</h3>
                      {isGraded ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-md uppercase">
                          Graded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md uppercase">
                          Pending Review
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      <span className="text-slate-500 font-semibold">Your Answer:</span> {sub.content}
                    </p>

                    {sub.feedback && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 mt-2">
                        <span className="font-semibold text-blue-400">Teacher's Feedback: </span>
                        {sub.feedback}
                      </div>
                    )}
                  </div>

                  {/* Score Card */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <span className="text-xs text-slate-400">Score</span>
                    <div className="text-2xl font-black text-white">
                      {isGraded ? (
                        <span>
                          <span className="text-blue-500">{sub.marksObtained}</span>
                          <span className="text-slate-500 text-sm font-normal"> / {sub.maxMarks}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-base font-medium">-- / {sub.maxMarks}</span>
                      )}
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