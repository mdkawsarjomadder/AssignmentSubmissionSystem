'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5074/api/Assignments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAssignments(res.data);
    } catch (err: any) {
      console.error('Failed to load assignments', err);
      setError('অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-slate-400">View available assignments and submit your work.</p>
          </div>
          <Link 
            href="/student/grades" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
          >
            My Grades & Feedback →
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading assignments...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{assignment.description}</p>
                <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                  <span>Max Marks: {assignment.maxMarks}</span>
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <button 
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition"
                >
                  Submit Assignment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}