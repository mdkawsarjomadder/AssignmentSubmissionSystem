"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "../../components/Navbar";
interface UserData {
  id: string | number;
  fullName: string;
  email: string;
  role: string;
}

interface SubjectData {
  id?: string | number;
  name?: string;
  subjectName?: string;
}

const defaultUsers: UserData[] = [
  { id: 1, fullName: "System Admin", email: "admin@school.com", role: "Admin" },
  { id: 2, fullName: "John Teacher", email: "teacher@school.com", role: "Teacher" },
  { id: 3, fullName: "Alice Student", email: "student@school.com", role: "Student" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "subjects">("users");
  const [users] = useState<UserData[]>(defaultUsers);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_BASE_URL = "http://localhost:5074";

      // 1. Fetch Subjects (Swagger অনুযায়ী: /api/Submissions/subjects)
      try {
        const subRes = await axios.get(`${API_BASE_URL}/api/Submissions/subjects`, config);
        if (subRes.data) {
          const list = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || [];
          setSubjects(list);
        }
      } catch (err) {
        console.warn("Subjects fetch failed.");
      }

      // 2. Fetch Assignments Count (Swagger অনুযায়ী: /api/Assignments)
      try {
        const assignRes = await axios.get(`${API_BASE_URL}/api/Assignments`, config);
        if (assignRes.data) {
          const list = Array.isArray(assignRes.data) ? assignRes.data : assignRes.data.data || [];
          setAssignmentsCount(list.length);
        }
      } catch (err) {
        console.warn("Assignments fetch failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBadge = (role: string) => {
    const roleStr = role.toLowerCase();
    if (roleStr.includes("admin")) {
      return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Admin</span>;
    } else if (roleStr.includes("teacher")) {
      return <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Teacher</span>;
    }
    return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Student</span>;
  };

  return (
    <ProtectedRoute allowedRole="Admin">
      <div className="min-h-screen bg-slate-950 text-white pb-12">
        <Navbar 
          title="Admin Control Center" 
          subtitle="Hello! Welcome back to your assignment control center." 
        />

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Total Users</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400">
                {users.length} Users
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Active Subjects</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                {loading ? "..." : `${subjects.length} Subjects`}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Total Assignments</p>
              <h3 className="text-2xl font-bold mt-1 text-sky-400">
                {loading ? "..." : `${assignmentsCount} Total`}
              </h3>
            </div>
          </div>

          <div className="flex space-x-3 mb-6 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "users" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "subjects" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Manage Subjects
            </button>
          </div>

          {activeTab === "users" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-mono">{u.id}</td>
                        <td className="p-3 font-medium text-white">{u.fullName}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Subjects List</h2>
              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <p className="text-xs text-slate-400">কোনো সাবজেক্ট পাওয়া যায়নি।</p>
                ) : (
                  subjects.map((s, index) => (
                    <div key={index} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white text-sm">{typeof s === 'string' ? s : s.name || s.subjectName || `Subject #${index + 1}`}</p>
                      </div>
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">Active</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}