'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

export default function SubmitAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      alert('অনুগ্রহ করে আপনার উত্তর লিখুন!');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      await axios.post(
        'http://localhost:5074/api/Submissions',
        {
          assignmentId: parseInt(assignmentId),
          answerContent: answerContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('আপনার উত্তর সফলভাবে জমা হয়েছে!');
      router.push('/student/dashboard');
    } catch (err: any) {
      console.error('Submission failed', err);
      alert(err.response?.data || 'উত্তর জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold">Submit Assignment Answer</h1>
          <p className="text-xs text-slate-400 mt-1">Assignment ID: #{assignmentId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Write Your Answer Below:
            </label>
            <textarea
              rows={8}
              required
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="এখানে আপনার অ্যাসাইনমেন্টের বিস্তারিত উত্তর লিখুন..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}