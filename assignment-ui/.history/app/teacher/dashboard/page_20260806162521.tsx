'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { setAuthToken } from '@/lib/auth'; // আপনার Auth helper

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5074/api/Auth/login', {
        email,
        password,
      });

      // API থেকে token গ্রহণ
      const token = response.data.token || response.data;
      if (token) {
        setAuthToken(token); // Cookie বা LocalStorage-এ টোকেন সেভ
        router.replace('/teacher/dashboard'); // replace ব্যবহার করলে ব্যাকে যাওয়ার ঝামেলা থাকে না
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError('Invalid email or password. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Teacher Login</h2>
        
        {error && <p className="text-rose-500 text-sm text-center">{error}</p>}

        <div>
          <label className="text-xs text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500"
            placeholder="teacher@school.com"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}