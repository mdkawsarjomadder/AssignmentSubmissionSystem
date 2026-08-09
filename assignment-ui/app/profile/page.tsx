"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>("");

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center items-center">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
              {role ? role.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold">User Profile</h2>
              <p className="text-xs text-slate-400 capitalize">Role: <span className="text-indigo-400 font-semibold">{role}</span></p>
            </div>
          </div>

          <div className="space-y-4 text-sm border-t border-slate-800 pt-4">
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Account Type</span>
              <span className="font-medium text-slate-200 capitalize">{role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}