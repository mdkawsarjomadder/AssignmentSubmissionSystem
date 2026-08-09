"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Subject {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  subjectId: number;
}

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  content: string;
  marksObtained: number | null;
  feedback: string;
  status: string;
}

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // New Assignment Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newSubjectId, setNewSubjectId] = useState<number | "">("");

  // Grading Form State
  const [marksObtained, setMarksObtained] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

  const formatDate = (dateString: any) => {
    if (!dateString) return "No Due Date";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1) {
      return "No Due Date";
    }
    return parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [subRes, assignRes] = await Promise.all([
        axios.get("http://localhost:5074/api/Submissions/subjects", config),
        axios.get("http://localhost:5074/api/Assignments", config),
      ]);

      setSubjects(subRes.data || []);
      setAssignments(assignRes.data || []);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const handleSelectAssignment = async (assignmentId: number) => {
    try {
      setSelectedAssignmentId(assignmentId);
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5074/api/Submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        maxMarks: Number(newMaxMarks),
        subjectId: Number(newSubjectId),
      };

      await axios.post("http://localhost:5074/api/Assignments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!");
      setShowCreateModal(false);
      
      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      
      fetchInitialData();
    } catch (err) {
      alert("অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে।");
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        marksObtained: Number(marksObtained),
        feedback: feedback,
      };

      await axios.put(`http://localhost:5074/api/Submissions/${selectedSubmission.id}/grade`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("মার্কস ও ফিডব্যাক সফলভাবে সেভ হয়েছে!");
      setSelectedSubmission(null);
      if (selectedAssignmentId) handleSelectAssignment(selectedAssignmentId);
    } catch (err: any) {
      alert(err.response?.data || "গ্রেড করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-slate-400 text-sm">অ্যাসাইনমেন্ট তৈরি ও স্টুডেন্টদের উত্তর মূল্যায়ন করুন</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            + Create Assignment
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Assignments List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="font-semibold text-lg mb-4 text-slate-200">
              Assignments ({assignments.length})
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAssignment(item.id)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer ${
                    selectedAssignmentId === item.id
                      ? "bg-indigo-950/40 border-indigo-500"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Due: {formatDate(item.dueDate)}
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Max Marks: {item.maxMarks}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Submissions List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="font-semibold text-lg mb-4 text-slate-200">
              Student Submissions {selectedAssignmentId ? `(#${selectedAssignmentId})` : ""}
            </h2>

            {!selectedAssignmentId ? (
              <p className="text-slate-500 text-sm py-10 text-center">
                বামপাশের তালিকা থেকে যেকোনো একটি অ্যাসাইনমেন্ট নির্বাচন করুন
              </p>
            ) : loading ? (
              <p className="text-slate-400 text-sm py-10 text-center">লোডিং সাবমিশনস...</p>
            ) : submissions.length === 0 ? (
              <p className="text-slate-500 text-sm py-10 text-center">এখনো কোনো স্টুডেন্ট উত্তর জমা দেয়নি</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3">Status / Marks</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-medium text-white">{sub.studentName}</div>
                          <div className="text-xs text-slate-500">{sub.studentEmail}</div>
                        </td>
                        <td className="p-3 text-xs">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          {sub.marksObtained !== null ? (
                            <span className="text-emerald-400 font-bold">{sub.marksObtained} Marks</span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20">
                              Pending Grade
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setMarksObtained(sub.marksObtained || 0);
                              setFeedback(sub.feedback || "");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs px-3 py-1.5 rounded transition cursor-pointer"
                          >
                            Grade / View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal 1: Create Assignment */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-bold">Create New Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subject</label>
                  <select
                    required
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Max Marks</label>
                    <input
                      type="number"
                      required
                      value={newMaxMarks}
                      onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Grade Submission */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-bold">Grade Submission</h3>
                <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="mb-4">
                <span className="text-xs text-slate-400">Student Answer:</span>
                <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedSubmission.content}
                </p>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Feedback</label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="স্টুডেন্টকে সুনির্দিষ্ট ফিডব্যাক দিন..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium">
                    Save Grade
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