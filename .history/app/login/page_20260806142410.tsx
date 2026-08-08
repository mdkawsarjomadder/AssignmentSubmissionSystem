'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('teacher@school.com');
  const [password, setPassword] = useState('Teacher123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Corrected Port and Endpoint
      const response = await axios.post('http://localhost:5074/api/Auth/login', {
        email,
        password,
      });

      const { token, role } = response.data;

      if (token) {
        setAuthToken(token);

        // Role bases routing
        if (role === 'Teacher') {
          router.push('/teacher/dashboard');
        } else if (role === 'Student') {
          router.push('/student/dashboard');
        } else if (role === 'Admin') {
          router.push('/admin/users');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data || 
        'লগইন করতে সমস্যা হয়েছে। ইমেইল বা পাসওয়ার্ড পরীক্ষা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Assignment Portal</h1>
          <p className="text-sm text-slate-500 mt-2">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teacher@school.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'লগইন হচ্ছে...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-1 text-center">
          <p><span className="font-semibold text-slate-700">Teacher:</span> teacher@school.com / Teacher123!</p>
          <p><span className="font-semibold text-slate-700">Student:</span> student@school.com / Student123!</p>
        </div>
      </div>
    </div>
  );
}