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
      <div className="min-h-screen flex items-center justify-center font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center p-6 rounded-2xl border shadow-xl" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Teacher Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              Welcome back! Here you can manage assignments and student submissions.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
            style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
          >
            Logout
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Create New Assignment</h2>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
              Publish a new task, homework, or project for your students.
            </p>
            <button 
              className="px-5 py-2.5 font-semibold rounded-xl text-sm transition cursor-pointer"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              + Create Assignment
            </button>
          </div>

          <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>View Submissions</h2>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
              Check submitted assignments from students and provide marks with feedback.
            </p>
            <button 
              className="px-5 py-2.5 font-semibold rounded-xl text-sm border transition cursor-pointer"
              style={{ backgroundColor: '#334155', color: '#ffffff', borderColor: '#475569' }}
            >
              View All Submissions
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}