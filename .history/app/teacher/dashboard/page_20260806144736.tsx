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
      <div
        className="min-h-screen flex items-center justify-center font-medium"
        style={{ backgroundColor: '#0b0f19', color: '#ffffff' }}
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-8 flex justify-center items-start"
      style={{ backgroundColor: '#0b0f19', color: '#ffffff' }}
    >
      {/* Outer Main Container Card (Main Body) */}
      <div
        className="w-full max-w-5xl rounded-3xl border p-6 sm:p-10 shadow-2xl space-y-8"
        style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}
      >
        {/* Header Section */}
        <div
          className="flex justify-between items-center pb-6 border-b"
          style={{ borderColor: '#1f2937' }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Teacher Dashboard
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#9ca3af' }}>
              Hello! Welcome back to your assignment control center.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-rose-950/30 cursor-pointer"
            style={{ color: '#f43f5e', borderColor: '#881337' }}
          >
            Logout
          </button>
        </div>

        {/* 2-Column Action Cards Section (Inside Main Body) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Assignment Card */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-between items-center text-center space-y-6 transition hover:border-blue-500/50"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                Create New Assignment
              </h2>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                Publish new tasks or homework for your students.
              </p>
            </div>
            <button
              className="px-6 py-2.5 font-semibold rounded-xl text-xs transition shadow-lg cursor-pointer hover:bg-blue-500"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              + Create
            </button>
          </div>

          {/* View Submissions Card */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-between items-center text-center space-y-6 transition hover:border-slate-500/50"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                View Submissions
              </h2>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                Check student submissions and grade assignments.
              </p>
            </div>
            <button
              className="px-6 py-2.5 font-semibold rounded-xl text-xs border transition cursor-pointer hover:bg-slate-700"
              style={{ backgroundColor: '#374151', color: '#ffffff', borderColor: '#4b5563' }}
            >
              View All Submissions
            </button>
          </div>

        </div>

        {/* Lower Content / Submissions Area */}
        <div
          className="p-8 rounded-2xl border text-center"
          style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
        >
          <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
            No active assignments or submissions to show right now.
          </p>
        </div>

      </div>
    </div>
  );
}