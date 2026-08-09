'use client';

import { useRouter } from 'next/navigation';

interface NavbarProps {
  onLogout?: () => void;
  title?: string;
}

export default function Navbar({ onLogout, title = "Teacher Dashboard" }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // ১. যদি বাইরে থেকে প্রপ হিসেবে onLogout দেওয়া থাকে
    if (onLogout) {
      onLogout();
      return;
    }

    // ২. ডিফল্ট লগআউট হ্যান্ডলার (টোকেন ক্লিয়ার করে রিডাইরেক্ট)
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <div
      className="flex justify-between items-center pb-6 border-b"
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
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-rose-950/30 cursor-pointer"
        style={{ color: '#f43f5e', borderColor: '#881337' }}
      >
        Logout
      </button>
    </div>
  );
}