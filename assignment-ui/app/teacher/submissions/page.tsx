'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';

interface Submission {
  id: number;
  assignmentTitle: string;
  studentName: string;
  content: string;
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
}

export default function ViewSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.get('http://localhost:5074/api/Submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSub) return;
    setGrading(true);

    try {
      const token = getAuthToken();
      // 🔴 'axios.post' এর জায়গায় 'axios.put' ব্যবহার করা হয়েছে
      await axios.put(
        `http://localhost:5074/api/Submissions/${selectedSub.id}/grade`,
        {
          marksObtained: Number(marks),
          feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Grading error', err);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold">Student Submissions</h1>
            <p className="text-sm text-slate-400 mt-1">Review student answers and assign grades.</p>
          </div>
          <Link
            href="/teacher/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold hover:bg-slate-800 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl">No submissions found yet.</div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                    {sub.assignmentTitle || 'Assignment'}
                  </span>
                  <h3 className="text-base font-bold">Student: {sub.studentName || 'Student'}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">Answer: {sub.content}</p>
                </div>

                <div className="flex items-center gap-4">
                  {sub.marksObtained !== undefined && sub.marksObtained !== null ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1.5 rounded-xl">
                      Graded: {sub.marksObtained}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800 px-3 py-1.5 rounded-xl">
                      Pending Grade
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setMarks(sub.marksObtained || 0);
                      setFeedback(sub.feedback || '');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Grade Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grade Modal */}
        {selectedSub && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Grade Submission</h3>
                <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="text-xs font-semibold text-slate-400">Student Answer:</p>
                <p className="text-xs text-slate-200">{selectedSub.content}</p>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback (Optional)</label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Good job! or Keep improving..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="w-1/2 py-2.5 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    {grading ? 'Saving...' : 'Save Grade'}
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