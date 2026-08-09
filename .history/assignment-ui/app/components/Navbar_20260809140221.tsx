'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onLogout?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Navbar({
  onLogout,
  title = "Dashboard",
  subtitle = "Hello! Welcome back to your assignment control center.",
  children
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const handleProfileNavigation = () => {
    router.push("/profile");
  };

  return (
    // max-w-6xl mx-auto px-6 যোগ করায় Navbar-এর ডানে ও বামে খালি জায়গা (Space) চলে আসবে
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm mt-1 text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {children}

        <button
          onClick={handleProfileNavigation}
          className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-800 cursor-pointer text-slate-200 border-slate-700"
        >
          Profile
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-rose-950/30 cursor-pointer text-rose-500 border-rose-900/60"
        >
          Logout
        </button>
      </div>
    </div>
  );
}