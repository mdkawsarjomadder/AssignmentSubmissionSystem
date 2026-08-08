'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentName: string;
  content: string;
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
}

interface NewAssignment {
  title: string;
  description: string;
  maxMarks: number;
  dueDate: string;
  subjectId: number;
}

export default function TeacherDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    title: '',
    description: '',
    maxMarks: 100,
    dueDate: '',
    subjectId: 1,
  });

  // Grade Modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = res.data.data || res.data;
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load submissions', err);
      if (err.response?.status === 403) {
        setError('অ্যাক্সেস মেলেনি (403)। অনুগ্রহ করে Teacher হিসেবে পুনরায় লগইন করুন।');
      } else {
        setError('সাবমিশন লোড করতে সমস্যা হয়েছে।');
      }
    } 
   
  };

  // Create Assignment Handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken() || localStorage.getItem('token');
      await axios.post('http://localhost:5074/api/Assignments', newAssignment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!');
      setShowCreateModal(false);
      setNewAssignment({ title: '', description: '', maxMarks: 100, dueDate: '', subjectId: 1 });
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data || 'অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে।');
    }
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
      fetchSubmissions(); // Reload list
    } catch (err: any) {
      alert('গ্রেড সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage assignments and grade student submissions.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            + Create New Assignment
          </button>
        </div>

        {/* Submissions List Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-slate-300">
            Student Submissions
          </div>

          {loading ? (
            <p className="p-6 text-center text-slate-400">Loading submissions...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-400">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="p-6 text-center text-slate-400">No student submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Assignment</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Submitted Answer</th>
                    <th className="p-4">Marks</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-medium text-white">{sub.assignmentTitle}</td>
                      <td className="p-4">{sub.studentName}</td>
                      <td className="p-4 max-w-xs truncate">{sub.content}</td>
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

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Create New Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
                    <input
                      type="number"
                      required
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/2 py-2 border border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
                  >
                    Save Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grade Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Grade: {selectedSubmission.assignmentTitle}</h3>
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
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback</label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="w-1/2 py-2 border border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition"
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