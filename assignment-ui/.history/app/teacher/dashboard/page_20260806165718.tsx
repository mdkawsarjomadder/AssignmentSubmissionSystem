'use client';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center">
      {/* দুই পাশে কিছুটা গ্যাপ রাখার জন্য px-6 md:px-16 lg:px-24 যোগ করা হয়েছে */}
      <div className="w-full px-6 md:px-16 lg:px-24 py-8 flex flex-col space-y-8">
        
        {/* উপরের সেকশন: নেভবার / টাইটেল */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Hello! Welcome back to your assignment control center.
            </p>
          </div>
          <button
            className="px-6 py-2.5 rounded-xl border border-rose-950/70 text-rose-500 text-xs font-semibold hover:bg-rose-950/20 transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* মাঝের ২টি অ্যাকশন কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* কার্ড ১ */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl transition hover:border-blue-900/50"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                Create New Assignment
              </h2>
              <p className="text-xs text-slate-400">
                Publish new tasks or homework for your students.
              </p>
            </div>
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg cursor-pointer"
            >
              + Create
            </button>
          </div>

          {/* কার্ড ২ */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl transition hover:border-slate-700/50"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                View Submissions
              </h2>
              <p className="text-xs text-slate-400">
                Check student submissions and grade assignments.
              </p>
            </div>
            <button
              className="px-6 py-3 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-white hover:bg-slate-700/60 transition cursor-pointer"
            >
              View All Submissions
            </button>
          </div>
        </div>

        {/* নিচের কন্টেন্ট এরিয়া */}
        <div className="flex-1 flex items-start justify-center">
          <div
            className="w-full p-8 rounded-2xl border border-slate-800 text-center flex items-center justify-center"
            style={{ backgroundColor: '#111827' }}
          >
            <p className="text-sm text-slate-400">
              No active assignments or submissions to show right now.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}