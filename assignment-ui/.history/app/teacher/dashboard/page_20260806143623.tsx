'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken } from '@/lib/auth';

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-medium">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back! Here you can manage assignments and student submissions.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
            <h2 className="text-lg font-semibold text-white mb-2">Create New Assignment</h2>
            <p className="text-slate-400 text-sm mb-4">
              Publish a new task or homework for your students.
            </p>
            <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition cursor-pointer">
              + Create Assignment
            </button>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-md">
            <h2 className="text-lg font-semibold text-white mb-2">View Submissions</h2>
            <p className="text-slate-400 text-sm mb-4">
              Check submitted assignments and grade your students.
            </p>
            <button className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition cursor-pointer">
              View All Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}