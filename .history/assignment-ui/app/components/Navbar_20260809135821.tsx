"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Navbar({ title, subtitle, children }: NavbarProps) {
  const router = Router();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {children}

          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}