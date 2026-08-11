'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

interface AssignmentDetails {
  id: number;
  title: string;
  deadline: string;
}

export default function SubmitAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Assignment details এবং Existing Submission Fetch করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken() || localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Assignment Details
        const assignRes = await axios.get(
          `http://localhost:5074/api/Assignments/${assignmentId}`,
          { headers }
        );
        const assignData = assignRes.data;
        setAssignment(assignData);

        // Check if Deadline has passed
        if (assignData.deadline) {
          const deadlineDate = new Date(assignData.deadline);
          if (new Date() > deadlineDate) {
            setIsExpired(true);
          }
        }

        // Fetch Existing Submission (যদি স্টুডেন্ট আগে জমা দিয়ে থাকে)
        try {
          const subRes = await axios.get(
            `http://localhost:5074/api/Submissions/my-submissions`,
            { headers }
          );
          
          const existingSub = subRes.data?.find(
            (sub: any) => sub.assignmentId === parseInt(assignmentId)
          );

          if (existingSub) {
            setAnswerContent(existingSub.answerContent || '');
            setSubmissionId(existingSub.id);
            setIsEditMode(true);
          }
        } catch (subErr) {
          console.log('No existing submission found or error fetching submissions:', subErr);
        }

      } catch (err) {
        console.error('Error fetching assignment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  // 2. Submit or Update Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      alert('অনুগ্রহ করে আপনার উত্তর লিখুন!');
      return;
    }

    if (isExpired) {
      alert('সাময়িক দুঃখিত! এই অ্যাসাইনমেন্টের ডেডলাইন পার হয়ে গেছে।');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditMode && submissionId) {
        // Update existing submission (PUT Request)
        await axios.put(
          `http://localhost:5074/api/Submissions/${submissionId}`,
          {
            answerContent: answerContent,
          },
          { headers }
        );
        alert('আপনার উত্তর সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Create new submission (POST Request)
        await axios.post(
          'http://localhost:5074/api/Submissions',
          {
            assignmentId: parseInt(assignmentId),
            answerContent: answerContent,
          },
          { headers }
        );
        alert('আপনার উত্তর সফলভাবে জমা হয়েছে!');
      }

      router.push('/student/dashboard');
    } catch (err: any) {
      console.error('Submission failed', err);
      alert(err.response?.data || 'উত্তর জমা দিতে/আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading assignment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Update Assignment Answer' : 'Submit Assignment Answer'}
            </h1>
            {isEditMode && (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-full font-medium">
                Edit Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assignment: {assignment?.title || `#${assignmentId}`}
          </p>

          {/* Deadline Alert Banner */}
          {assignment?.deadline && (
            <div className={`mt-3 p-3 rounded-xl border text-xs flex justify-between items-center ${
              isExpired 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300'
            }`}>
              <span>
                <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}
              </span>
              {isExpired && (
                <span className="font-semibold text-rose-500">Expired</span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Write Your Answer Below:
            </label>
            <textarea
              rows={8}
              required
              disabled={isExpired}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder={
                isExpired 
                  ? "ডেডলাইন শেষ হয়ে গেছে। এখন আর উত্তর দেওয়া বা পরিবর্তন করা যাবে না।" 
                  : "এখানে আপনার অ্যাসাইনমেন্টের বিস্তারিত উত্তর লিখুন..."
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={submitting || isExpired}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? (isEditMode ? 'Updating...' : 'Submitting...') 
                : (isEditMode ? 'Update Submission' : 'Submit Assignment')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}