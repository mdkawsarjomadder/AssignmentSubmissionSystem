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
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        
        {/* Top Header (as per sketch: Title and Logout on one line) */}
        <div
          className="flex justify-between items-center pb-4 border-b shadow-sm"
          style={{ borderColor: '#334155' }}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>
              Teacher Dashboard
            </h1>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              Welcome back! manage your assignments and submissions.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold cursor-pointer"
            style={{ color: '#e11d48' }}
          >
            Logout
          </button>
        </div>

        {/* Action Cards Container (col-md-6 style grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create New Assignment (Left col-md-6) */}
          <div
            className="p-8 rounded-2xl border shadow-lg flex flex-col items-center text-center space-y-6"
            style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
          >
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                Create New Assignment
              </h2>
            </div>
            <div>
              <button 
                className="px-6 py-2.5 font-semibold rounded-xl text-xs transition cursor-pointer"
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              >
                + Create
              </button>
            </div>
          </div>

          {/* View Submission (Right col-md-6) */}
          <div
            className="p-8 rounded-2xl border shadow-lg flex flex-col items-center text-center space-y-6"
            style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
          >
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                View Submission
              </h2>
            </div>
            <div>
              <button 
                className="px-6 py-2.5 font-semibold rounded-xl text-xs transition cursor-pointer"
                style={{ backgroundColor: '#334155', color: '#ffffff', borderColor: '#475569' }}
              >
                View All
              </button>
            </div>
          </div>

        </div>

        {/* Lower body section as per sketch */}
        <div 
          className="mt-12 p-6 rounded-2xl border min-h-[150px]"
          style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
        >
          {/* Future list of assignments/submissions would go here */}
          <p className="text-sm text-slate-500 text-center pt-8">No current assignments listed.</p>
        </div>

      </div>
    </div>
  );
}