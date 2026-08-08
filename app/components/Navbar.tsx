'use client';

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  return (
    <div
      className="flex justify-between items-center pb-6 border-b"
      style={{ borderColor: '#1f2937' }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Teacher Dashboard
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: '#9ca3af' }}>
          Hello! Welcome back to your assignment control center.
        </p>
      </div>
      <button
        onClick={onLogout}
        className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-rose-950/30 cursor-pointer"
        style={{ color: '#f43f5e', borderColor: '#881337' }}
      >
        Logout
      </button>
    </div>
  );
}