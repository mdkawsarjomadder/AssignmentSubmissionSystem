"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "classes" | "assignments">("users");

  // Mock Data for Demo
  const [users] = useState([
    { id: "1", name: "Anisur Rahman", email: "teacher@school.com", role: "Teacher" },
    { id: "2", name: "Rahim Uddin", email: "student@school.com", role: "Student" },
    { id: "3", name: "System Admin", email: "admin@school.com", role: "Admin" },
  ]);

  const [classes] = useState([
    { id: "101", name: "Class 10 - Physics", teacher: "Anisur Rahman" },
    { id: "102", name: "Class 9 - Mathematics", teacher: "Anisur Rahman" },
  ]);

  return (
    <ProtectedRoute allowedRole="Admin">
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar title="Admin Control Center" />

        <div className="max-w-6xl mx-auto p-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Total Users</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400">3 Users</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Active Classes / Courses</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">2 Classes</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">System Status</p>
              <h3 className="text-2xl font-bold mt-1 text-sky-400">Operational</h3>
            </div>
          </div>

          {/* Navigation Tabs */}
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
              onClick={() => setActiveTab("classes")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "classes" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Manage Classes/Subjects
            </button>
          </div>

          {/* Users Tab Content */}
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
                        <td className="p-3 font-medium text-white">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.role === "Admin"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : u.role === "Teacher"
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Classes Tab Content */}
          {activeTab === "classes" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Class & Subject Management</h2>
              <div className="space-y-3">
                {classes.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-slate-400 mt-0.5">Assigned Teacher: {c.teacher}</p>
                    </div>
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}