'use client';

import { useRouter } from 'next/navigation';

interface NavbarProps {
  onLogout?: () => void;
  title?: string;
}

export default function Navbar({ onLogout, title = "Dashboard" }: NavbarProps) {
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
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b gap-4 mb-8"
      style={{ borderColor: '#1f2937' }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: '#9ca3af' }}>
          Hello! Welcome back to your assignment control center.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleProfileNavigation}
          className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-800 cursor-pointer text-slate-200 border-slate-700"
        >
          Profile
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-rose-950/30 cursor-pointer"
          style={{ color: '#f43f5e', borderColor: '#881337' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}