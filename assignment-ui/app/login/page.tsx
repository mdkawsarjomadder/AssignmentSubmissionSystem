'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5074/api/Auth/login', {
        email,
        password,
      });

      console.log("Full API Response:", res.data);

      // API রেসপন্স থেকে ডেটা বের করার জন্য মাল্টিপল ফলব্যাক (যাতে যেকোনো স্ট্রাকচারেই কাজ করে)
      const data = res.data;
      const token = data.token || data.accessToken || (data.data && data.data.token);
      const role = data.role || (data.data && data.data.role);

      console.log("Extracted Token:", token);
      console.log("Extracted Role:", role);

      if (!token || !role) {
        setError("API থেকে Token বা Role সঠিকভাবে পাওয়া যায়নি! Developer Console (F12) চেক করুন।");
        setLoading(false);
        return;
      }

      // লোকাল স্টোরেজে সেভ করা
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // সঠিক ড্যাশবোর্ডে রিডাইরেক্ট
      const normalizedRole = String(role).trim().toLowerCase();

      if (normalizedRole === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (normalizedRole === 'student') {
        router.push('/student/dashboard');
      } else {
        setError(`অজানা রোল: ${role}`);
      }

    } catch (err: any) {
      console.error('Login Error:', err);
      setError(
        err.response?.data?.message || err.response?.data || 'লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Assignment System Login</h2>
        <p className="text-slate-400 text-sm mb-6 text-center">আপনার অ্যাকাউন্ট দিয়ে সাইন-ইন করুন</p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-300 mb-1">ইমেইল ঠিকানা</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.com"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'লগইন হচ্ছে...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}