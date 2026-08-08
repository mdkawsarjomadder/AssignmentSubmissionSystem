'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';

interface Subject {
  id: number;
  name: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setSubjects(data);
        if (data.length > 0) setSelectedSubjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = getAuthToken() || localStorage.getItem('token');
      await axios.post(
        'http://localhost:5074/api/Assignments',
        {
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          maxMarks: Number(maxMarks),
          subjectId: Number(selectedSubjectId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!');
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'অ্যাসাইনমেন্ট তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Create New Assignment</h1>
            <p className="text-xs text-slate-400 mt-1">Fill out the details to publish a new assignment for students.</p>
          </div>
          <Link
            href="/teacher/dashboard"
            className="px-3 py-1.5 border border-slate-800 text-slate-300 hover:bg-slate-900 rounded-lg text-xs font-medium transition"
          >
            ← Back
          </Link>
        </div>

        {/* Alerts */}
        {message && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-xl text-xs">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Integration Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              required
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition text-slate-200"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date & Time</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
              <input
                type="number"
                required
                min={1}
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Instructions</label>
            <textarea
              rows={4}
              required
              placeholder="Provide detailed instructions or question links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Publishing...' : 'Publish Assignment'}
          </button>
        </form>

      </div>
    </div>
  );
}