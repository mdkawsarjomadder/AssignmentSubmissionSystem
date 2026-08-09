"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  subjectName?: string;
  isSubmitted?: boolean;
}

interface GradeInfo {
  id: number;
  assignmentTitle: string;
  subjectName: string;
  submittedAt: string;
  content: string;
  marksObtained: number | null;
  maxMarks: number;
  feedback: string;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myGrades, setMyGrades] = useState<GradeInfo[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted">("all");
  const [selectedGrade, setSelectedGrade] = useState<GradeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ডাটা লোড করার ফাংশন
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // ১. অ্যাসাইনমেন্ট তালিকা এবং ২. আমার গ্রেড/সাবমিশন ডাটা একসাথে আনা
      const [assignmentsRes, gradesRes] = await Promise.all([
        axios.get("http://localhost:5074/api/Assignments", config),
        axios.get("http://localhost:5074/api/Submissions/my-grades", config),
      ]);

      const gradesData: GradeInfo[] = gradesRes.data || [];
      setMyGrades(gradesData);

      // সাবমিটেড অ্যাসাইনমেন্ট আইডিগুলির তালিকা
      const submittedIds = new Set(gradesData.map((g) => g.assignmentTitle));

      // অ্যাসাইনমেন্টগুলোতে isSubmitted ফ্ল্যাগ যুক্ত করা
      const updatedAssignments = (assignmentsRes.data || []).map((a: Assignment) => ({
        ...a,
        isSubmitted: submittedIds.has(a.title),
      }));

      setAssignments(updatedAssignments);
    } catch (err) {
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ফিল্টার অনুযায়ী অ্যাসাইনমেন্ট ফিল্টার করা
  const filteredAssignments = assignments.filter((item) => {
    if (filter === "pending") return !item.isSubmitted;
    if (filter === "submitted") return item.isSubmitted;
    return true; // "all"
  });

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      {/* ফিল্টার ট্যাব বাটনসমূহ */}
      <div className="flex gap-3 mb-6 bg-slate-900 p-1.5 rounded-lg w-fit border border-slate-800">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            filter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All ({assignments.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            filter === "pending" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Pending ({assignments.filter((a) => !a.isSubmitted).length})
        </button>
        <button
          onClick={() => setFilter("submitted")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            filter === "submitted" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Submitted ({assignments.filter((a) => a.isSubmitted).length})
        </button>
      </div>

      {/* অ্যাসাইনমেন্ট কার্ড লিস্ট */}
      {loading ? (
        <p className="text-slate-400">Loading assignments...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((item) => {
            const gradeInfo = myGrades.find((g) => g.assignmentTitle === item.title);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
                      {item.subjectName || "General"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        item.isSubmitted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.isSubmitted ? "Submitted" : "Pending"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs text-slate-400">
                  <span>Max Marks: {item.maxMarks}</span>

                  {item.isSubmitted && gradeInfo ? (
                    <button
                      onClick={() => setSelectedGrade(gradeInfo)}
                      className="text-indigo-400 hover:underline font-medium cursor-pointer"
                    >
                      View Result / Feedback
                    </button>
                  ) : (
                    <span className="text-amber-400 font-medium">Action Needed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Marks & Feedback Popup Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold">Submission Details</h3>
              <button
                onClick={() => setSelectedGrade(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Assignment Title</span>
                <p className="font-semibold text-base">{selectedGrade.assignmentTitle}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Your Answer</span>
                <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 mt-1 whitespace-pre-wrap">
                  {selectedGrade.content || "No text provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-xs">Obtained Marks</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {selectedGrade.marksObtained !== null
                      ? `${selectedGrade.marksObtained} / ${selectedGrade.maxMarks}`
                      : "Not Graded Yet"}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-xs">Submitted At</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {new Date(selectedGrade.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedGrade.feedback && (
                <div className="pt-2">
                  <span className="text-slate-400 block text-xs">Teacher's Feedback</span>
                  <p className="bg-indigo-950/40 border border-indigo-800/50 p-3 rounded-lg text-indigo-200 mt-1">
                    💬 {selectedGrade.feedback}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedGrade(null)}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}