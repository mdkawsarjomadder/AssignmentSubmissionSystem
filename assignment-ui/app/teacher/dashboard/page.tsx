"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Subject {
  id: number;
  name: string;
}

interface ClassCourse {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  subjectId: number;
  classId?: number;
  isPublished: boolean;
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

function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Toast Alert State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Assignment Form State
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [assignmentMaxMarks, setAssignmentMaxMarks] = useState(100);
  const [assignmentSubjectId, setAssignmentSubjectId] = useState<number | "">("");
  const [assignmentClassId, setAssignmentClassId] = useState<number | "">("");
  const [assignmentIsPublished, setAssignmentIsPublished] = useState(false);

  // Search & Filter States
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | "">("");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState("");

  // Grading & Status Form State
  const [marksObtained, setMarksObtained] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<string>("Graded");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "No Deadline";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1) {
      return "No Deadline";
    }
    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [subRes, classRes, assignRes] = await Promise.all([
        axios.get("http://localhost:5074/api/Submissions/subjects", config),
        axios.get("http://localhost:5074/api/Submissions/classes", config),
        axios.get("http://localhost:5074/api/Assignments", config),
      ]);

      setSubjects(subRes.data || []);
      setClasses(classRes.data || []);
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
      const res = await axios.get(
        `http://localhost:5074/api/Submissions/assignment/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDeadline("");
    setAssignmentMaxMarks(100);
    setAssignmentSubjectId("");
    setAssignmentClassId("");
    setAssignmentIsPublished(false);
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (item: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAssignment(item);
    setAssignmentTitle(item.title);
    setAssignmentDescription(item.description || "");
    setAssignmentDeadline(item.deadline ? item.deadline.split("T")[0] : "");
    setAssignmentMaxMarks(item.maxMarks);
    setAssignmentSubjectId(item.subjectId);
    setAssignmentClassId(item.classId || "");
    setAssignmentIsPublished(item.isPublished || false);
    setShowCreateModal(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentSubjectId || !assignmentClassId) {
      showToast("অনুগ্রহ করে Subject এবং Class/Course উভয় সিলেক্ট করুন।", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: assignmentTitle,
        description: assignmentDescription,
        deadline: new Date(assignmentDeadline).toISOString(),
        maxMarks: Number(assignmentMaxMarks),
        subjectId: Number(assignmentSubjectId),
        classId: Number(assignmentClassId),
        isPublished: assignmentIsPublished,
      };

      if (editingAssignment) {
        await axios.put(
          `http://localhost:5074/api/Assignments/${editingAssignment.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("অ্যাসাইনমেন্ট সফলভাবে আপডেট করা হয়েছে!", "success");
      } else {
        await axios.post("http://localhost:5074/api/Assignments", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast(
          assignmentIsPublished
            ? "অ্যাসাইনমেন্ট পাবলিশ করা হয়েছে!"
            : "অ্যাসাইনমেন্ট ড্রাফট হিসেবে সেভ হয়েছে!",
          "success"
        );
      }

      setShowCreateModal(false);
      fetchInitialData();
    } catch (err: any) {
      console.error("Save error:", err.response?.data || err);
      showToast("অ্যাসাইনমেন্ট সেভ করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleDeleteAssignment = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("আপনি কি নিশ্চিত যে এই অ্যাসাইনমেন্টটি ডিলিট করতে চান?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5074/api/Assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast("অ্যাসাইনমেন্ট সফলভাবে ডিলিট করা হয়েছে।", "success");

      if (selectedAssignmentId === id) {
        setSelectedAssignmentId(null);
        setSubmissions([]);
      }

      fetchInitialData();
    } catch (err: any) {
      showToast("অ্যাসাইনমেন্ট ডিলিট করা সম্ভব হয়নি।", "error");
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
        status: submissionStatus,
      };

      await axios.put(
        `http://localhost:5074/api/Submissions/${selectedSubmission.id}/grade`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("সাবমিশন স্ট্যাটাস ও মার্কস আপডেট হয়েছে!", "success");
      setSelectedSubmission(null);
      if (selectedAssignmentId) handleSelectAssignment(selectedAssignmentId);
    } catch (err: any) {
      showToast(err.response?.data || "আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const renderStatusBadge = (status: string, marks: number | null) => {
    switch (status) {
      case "Graded":
        return (
          <span className="bg-emerald-500/10 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded border border-emerald-500/20">
            Graded ({marks ?? 0})
          </span>
        );
      case "Resubmit Requested":
        return (
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded border border-rose-500/20 font-medium">
            Resubmit Requested
          </span>
        );
      case "Late Submission":
        return (
          <span className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded border border-purple-500/20 font-medium">
            Late Submission
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded border border-amber-500/20 font-medium">
            {status || "Submitted"}
          </span>
        );
    }
  };

  // Stats Calculation
  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter((a) => a.isPublished).length;
  const totalSubmissions = submissions.length;
  const pendingGrading = submissions.filter((s) => s.status !== "Graded").length;

  // Filtered Assignments Logic
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesClass = selectedClassFilter === "" || item.classId === Number(selectedClassFilter);
    return matchesSearch && matchesClass;
  });

  // Filtered Submissions Logic
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.studentEmail.toLowerCase().includes(submissionSearch.toLowerCase());
    const matchesStatus =
      submissionStatusFilter === "" ||
      (submissionStatusFilter === "Pending" ? sub.status !== "Graded" : sub.status === submissionStatusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all duration-300 ${
            toastType === "success"
              ? "bg-emerald-950 border-emerald-800 text-emerald-200"
              : "bg-rose-950 border-rose-800 text-rose-200"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-slate-400 text-sm">
              অ্যাসাইনমেন্ট তৈরি, পরিবর্তন ও স্টুডেন্টদের উত্তর মূল্যায়ন করুন
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            + Create Assignment
          </button>
        </div>

        {/* Summary Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Assignments</p>
              <h4 className="text-xl font-bold text-white mt-0.5">{totalAssignments}</h4>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Published</p>
              <h4 className="text-xl font-bold text-white mt-0.5">{publishedAssignments}</h4>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Submissions</p>
              <h4 className="text-xl font-bold text-white mt-0.5">
                {selectedAssignmentId ? totalSubmissions : "-"}
              </h4>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Grading</p>
              <h4 className="text-xl font-bold text-white mt-0.5">
                {selectedAssignmentId ? pendingGrading : "-"}
              </h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignments List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-lg mb-3 text-slate-200">
              Assignments ({filteredAssignments.length})
            </h2>

            {/* Assignments Search & Filter */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Search assignment..."
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredAssignments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAssignment(item.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                    selectedAssignmentId === item.id
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base text-slate-100 pr-1 leading-snug">
                        {item.title}
                      </h3>
                      {item.isPublished ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleOpenEditModal(item, e)}
                        title="Edit Assignment"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      <button
                        onClick={(e) => handleDeleteAssignment(item.id, e)}
                        title="Delete Assignment"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs mt-2">
                    Deadline: {formatDate(item.deadline)}
                  </p>

                  <span className="inline-block mt-3 text-xs bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md font-medium border border-slate-700/50">
                    Max Marks: {item.maxMarks}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions List Section */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-lg mb-4 text-slate-200">
              Student Submissions{" "}
              {selectedAssignmentId ? `(#${selectedAssignmentId})` : ""}
            </h2>

            {/* Submissions Search & Filter Bar */}
            {selectedAssignmentId && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search student by name or email..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <select
                  value={submissionStatusFilter}
                  onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition"
                >
                  <option value="">All Status</option>
                  <option value="Graded">Graded</option>
                  <option value="Pending">Pending Evaluation</option>
                  <option value="Resubmit Requested">Resubmit Requested</option>
                  <option value="Late Submission">Late Submission</option>
                </select>
              </div>
            )}

            {!selectedAssignmentId ? (
              <p className="text-slate-500 text-sm py-10 text-center">
                বামপাশের তালিকা থেকে যেকোনো একটি অ্যাসাইনমেন্ট নির্বাচন করুন
              </p>
            ) : loading ? (
              <p className="text-slate-400 text-sm py-10 text-center">
                লোডিং সাবমিশনস...
              </p>
            ) : filteredSubmissions.length === 0 ? (
              <p className="text-slate-500 text-sm py-10 text-center">
                কোনো সাবমিশন পাওয়া যায়নি
              </p>
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
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-medium text-white">{sub.studentName}</div>
                          <div className="text-xs text-slate-500">{sub.studentEmail}</div>
                        </td>
                        <td className="p-3 text-xs">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {renderStatusBadge(sub.status, sub.marksObtained)}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setMarksObtained(sub.marksObtained || 0);
                              setFeedback(sub.feedback || "");
                              setSubmissionStatus(sub.status || "Graded");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Grade / Change Status
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

        {/* Modal: Create / Edit Assignment */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    অ্যাসাইনমেন্টের তথ্য ও শ্রেণি নির্বাচন করুন
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="অ্যাসাইনমেন্টের শিরোনাম দিন"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Class / Course</label>
                    <select
                      required
                      value={assignmentClassId}
                      onChange={(e) => setAssignmentClassId(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Subject</label>
                    <select
                      required
                      value={assignmentSubjectId}
                      onChange={(e) => setAssignmentSubjectId(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={assignmentDeadline}
                      onChange={(e) => setAssignmentDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Max Marks</label>
                    <input
                      type="number"
                      required
                      value={assignmentMaxMarks}
                      onChange={(e) => setAssignmentMaxMarks(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="অ্যাসাইনমেন্টের বিবরণ লিখুন..."
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={assignmentIsPublished}
                    onChange={(e) => setAssignmentIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600 bg-slate-950 border-slate-800 cursor-pointer"
                  />
                  <label htmlFor="isPublished" className="text-slate-300 font-medium cursor-pointer text-sm">
                    Publish Assignment immediately
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-slate-800/80 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    {editingAssignment ? "Update Assignment" : "Save Assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Grade / Evaluate Submission */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Evaluate Submission</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSubmission.studentName}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-slate-400 font-medium mb-1">Student Answer Content:</p>
                <div className="text-sm text-slate-200 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {selectedSubmission.content || "No content provided."}
                </div>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Marks Obtained</label>
                    <input
                      type="number"
                      required
                      value={marksObtained}
                      onChange={(e) => setMarksObtained(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Status</label>
                    <select
                      value={submissionStatus}
                      onChange={(e) => setSubmissionStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="Graded">Graded</option>
                      <option value="Resubmit Requested">Resubmit Requested</option>
                      <option value="Late Submission">Late Submission</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Teacher Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="স্টুডেন্টের কাজের উপর মন্তব্য লিখুন..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
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

export default TeacherDashboard;