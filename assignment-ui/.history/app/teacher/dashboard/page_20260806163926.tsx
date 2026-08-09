'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import Navbar from '@/app/components/Navbar';
import TeacherActionCards from '@/app/components/TeacherActionCards';

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/login'; // router.push এর বদলে window.location ব্যবহার করুন
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    window.location.href = '/login';
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
      <div
        className="w-full max-w-5xl rounded-3xl border p-6 sm:p-10 shadow-2xl space-y-8"
        style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}
      >
        <Navbar onLogout={handleLogout} />
        <TeacherActionCards />

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