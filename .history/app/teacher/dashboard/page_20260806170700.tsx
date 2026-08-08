'use client';

import { useState } from 'react';
import CreateAssignmentModal from '@/app/components/CreateAssignmentModal';

export default function TeacherDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssignmentCreated = () => {
    console.log('Assignment Created Successfully!');
    // পরে এখানে assignment list refresh করবেন
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center">
      <div className="w-full px-6 md:px-16 lg:px-24 py-8 flex flex-col space-y-8">

        {/* Header */}
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

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Create Assignment */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                Create New Assignment
              </h2>

              <p className="text-xs text-slate-400">
                Publish new tasks or homework for your students.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition shadow-lg cursor-pointer"
            >
              + Create
            </button>
          </div>

          {/* View Submission */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                View Submissions
              </h2>

              <p className="text-xs text-slate-400">
                Check student submissions and grade assignments.
              </p>
            </div>

            <button
              className="px-6 py-3 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
            >
              View All Submissions
            </button>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex-1">
          <div
            className="w-full p-8 rounded-2xl border border-slate-800 text-center"
            style={{ backgroundColor: '#111827' }}
          >
            <p className="text-sm text-slate-400">
              No active assignments or submissions to show right now.
            </p>
          </div>
        </div>

      </div>

      {/* Modal */}
      <CreateAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAssignmentCreated}
      />
    </div>
  );
}