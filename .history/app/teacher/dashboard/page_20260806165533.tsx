'use client';

// ... (আপনার প্রয়োজন অনুযায়ী ইম্পোর্ট, যেমন অথ স্টেট ইত্যাদি) ...

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* মেইন কন্টেন্ট এরিয়া - যা ফুল স্ক্রিন জুড়ে থাকবে */}
      <div className="flex-1 flex flex-col">
        
        {/* উপরের সেকশন: টাইটেল, সাব-টাইটেল এবং লগআউট বাটন */}
        <div className="flex items-center justify-between p-10 border-b border-slate-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
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

        {/* মাঝের অ্যাকশন কার্ড সেকশন */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
          {/* কার্ড ১: Create New Assignment */}
          <div
            className="p-8 rounded-3xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-2xl transition hover:border-blue-900/50"
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

          {/* কার্ড ২: View Submissions */}
          <div
            className="p-8 rounded-3xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-2xl transition hover:border-slate-700/50"
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

        {/* নিচের কন্টেন্ট সেকশন - ফুল স্ক্রিনের বাকি অংশ জুড়ে থাকবে */}
        <div className="flex-1 p-10 flex items-start justify-center">
          <div
            className="w-full h-full p-8 rounded-3xl border border-slate-800 text-center flex items-center justify-center"
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