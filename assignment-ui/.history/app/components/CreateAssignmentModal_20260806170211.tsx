'use client';

import { useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      await axios.post(
        'http://localhost:5074/api/Assignments',
        {
          title,
          description,
          course,
          dueDate: new Date(dueDate).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // ফর্ম ক্লিয়ার করা
      setTitle('');
      setDescription('');
      setCourse('');
      setDueDate('');

      onSuccess(); // ড্যাশবোর্ড আপডেট করার জন্য
      onClose(); // মোডাল বন্ধ করার জন্য
    } catch (err: any) {
      console.error('Create Assignment Error:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'অ্যাসাইনমেন্ট তৈরি করতে ব্যর্থ হয়েছে। ব্যাকএন্ড চেক করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative">
        {/* মোডাল হেডার */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold">Create New Assignment</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* ফর্ম ফিল্ডসমূহ */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Physics Homework"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Subject</label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Physics 101"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide instructions for the assignment..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* অ্যাকশন বাটন */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 transition text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}