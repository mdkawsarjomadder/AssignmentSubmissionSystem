'use client';

import { useState, useEffect } from 'react';
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
  const [subjectId, setSubjectId] = useState<number | string>(1);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API থেকে Subject List ফেচ করা (Handles default subject if 404 error occurs)
  useEffect(() => {
    if (isOpen) {
      const fetchSubjects = async () => {
        try {
          const token = getAuthToken();
          const res = await axios.get('http://localhost:5074/api/Subjects', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = res.data.data || res.data;
          if (Array.isArray(list) && list.length > 0) {
            setSubjects(list);
            setSubjectId(list[0].id);
          }
        } catch (err: any) {
      console.warn('Subjects API not found (404), using Default Subject (ID: 1).');          setSubjectId(1);
        }
      };
      fetchSubjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();

      // AssignmentResponseDto অনুযায়ী প্রস্তুতকৃত Payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline).toISOString(),
        maxMarks: Number(maxMarks),
        subjectId: Number(subjectId) || 1,
        isPublished: true,
      };

      console.log('Sending Payload to API:', payload);

      await axios.post('http://localhost:5074/api/Assignments', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // ফর্ম রিসেট
      setTitle('');
      setDescription('');
      setDeadline('');
      setMaxMarks(100);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Create Assignment Error:', err);
      const backendError =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Failed to create assignment.';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative">
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
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
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

          {/* Subject & Max Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                {subjects.length === 0 ? (
                  <option value="1">Default Subject (ID: 1)</option>
                ) : (
                  subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name || sub.title || `Subject #${sub.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
              <input
                type="number"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Description */}
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

          {/* Action Buttons */}
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