'use client';

export default function TeacherActionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Create Assignment Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col justify-between items-center text-center space-y-6 transition hover:border-blue-500/50"
        style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">
            Create New Assignment
          </h2>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Publish new tasks or homework for your students.
          </p>
        </div>
        <button
          className="px-6 py-2.5 font-semibold rounded-xl text-xs transition shadow-lg cursor-pointer hover:bg-blue-500"
          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
        >
          + Create
        </button>
      </div>

      {/* View Submissions Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col justify-between items-center text-center space-y-6 transition hover:border-slate-500/50"
        style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">
            View Submissions
          </h2>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Check student submissions and grade assignments.
          </p>
        </div>
        <button
          className="px-6 py-2.5 font-semibold rounded-xl text-xs border transition cursor-pointer hover:bg-slate-700"
          style={{ backgroundColor: '#374151', color: '#ffffff', borderColor: '#4b5563' }}
        >
          View All Submissions
        </button>
      </div>
    </div>
  );
}