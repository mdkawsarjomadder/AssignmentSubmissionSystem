'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import CreateAssignmentModal from '@/app/components/CreateAssignmentModal';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  subjectName?: string;
  createdBy?: string;
}

export default function TeacherDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5074/api/Assignments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center">
      <div className="w-full px-6 md:px-16 lg:px-24 py-8 flex flex-col space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Hello! Welcome back to your assignment control center.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl border border-rose-950/70 text-rose-500 text-xs font-semibold hover:bg-rose-950/20 transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Assignment Card */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Create New Assignment</h2>
              <p className="text-xs text-slate-400">Publish new tasks or homework for your students.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg cursor-pointer"
            >
              + Create
            </button>
          </div>

          {/* View Submissions Card */}
          <div
            className="p-8 rounded-2xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 shadow-xl"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">View Submissions</h2>
              <p className="text-xs text-slate-400">Check student submissions and grade assignments.</p>
            </div>
            {/* সঠিকভাবে Link যুক্ত করা হয়েছে */}
            <Link href="/teacher/submissions">
              <button className="px-6 py-3 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-white hover:bg-slate-700/60 transition cursor-pointer">
                View All Submissions
              </button>
            </Link>
          </div>
        </div>

        {/* Assignment List */}
        <div className="flex-1 flex flex-col space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Active Assignments</h3>

          {loading ? (
            <div className="p-8 rounded-2xl border border-slate-800 text-center text-slate-400 bg-slate-900">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div
              className="w-full p-8 rounded-2xl border border-slate-800 text-center flex items-center justify-center"
              style={{ backgroundColor: '#111827' }}
            >
              <p className="text-sm text-slate-400">
                No active assignments or submissions to show right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-950 text-blue-400 border border-blue-800">
                        {item.subjectName || 'Assignment'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Max: {item.maxMarks} Marks
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Deadline</span>
                      <span className="font-medium text-slate-300">
                        {new Date(item.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* কার্ডের ভেতরে সঠিক View Details বাটন দেওয়া হলো */}
                    <Link href="/teacher/submissions">
                      <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition text-xs cursor-pointer">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Component */}
      <CreateAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAssignments} 
      />
    </div>
  );
}