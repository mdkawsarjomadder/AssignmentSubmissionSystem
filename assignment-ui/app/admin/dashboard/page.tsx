"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "../../components/Navbar";

interface UserData {
  id: number;
  name?: string;
  fullName?: string;
  email: string;
  role: string | number;
}

interface SubjectData {
  id: number;
  name?: string;
  subjectName?: string;
}

interface TeacherAssignmentData {
  id: number;
  teacherName: string;
  subjectName: string;
  className: string;
  assignedAt: string;
}

interface AssignmentData {
  id: number;
  title: string;
  teacherName: string;
  subjectName: string;
  dueDate: string;
  submissionsCount: number;
}

interface SubmissionData {
  id: number;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  grade?: string | number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "subjects" | "assign" | "assignments" | "submissions">("users");
  const [users, setUsers] = useState<UserData[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentData[]>([]);
  const [allAssignments, setAllAssignments] = useState<AssignmentData[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionData[]>([]);

  //password----------
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  
  const [selectedClassGroupId, setSelectedClassGroupId] = useState<string>("");
  const [classList, setClassList] = useState<any[]>([]); 

  // Forms State
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("Class 6");
  
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5074";

  // ১. সমস্ত ডাটা এবং Class List একসাথে ফেচ করার ফাংশন
  const fetchData = async () => {
  setLoading(true);
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    // Fetch Classes
    const classRes = await axios.get(`${API_BASE_URL}/api/Submissions/classes`, config);
    if (classRes.data && Array.isArray(classRes.data) && classRes.data.length > 0) {
      setClassList(classRes.data);
      // প্রথম ডাটাবেজ ID-টি ডিফোল্ট হিসেবে সেট করুন (যেমন: 9)
      const firstClassId = classRes.data[0].id || classRes.data[0].Id;
      setSelectedClassGroupId(String(firstClassId));
    }

    //  Fetch Subjects
    const subRes = await axios.get(`${API_BASE_URL}/api/Submissions/subjects`, config);
    if (subRes.data) {
      const list = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || [];
      setSubjects(list);
    }

    // Fetch Users
    const userRes = await axios.get(`${API_BASE_URL}/api/Admin/users`, config);
    if (userRes.data) setUsers(userRes.data);

  } catch (err) {
    console.warn("Error fetching dashboard data:", err);
  } finally {
    setLoading(false);
  }
};

  //  পেজ লোড হবার পর fetchData কল হবে
  useEffect(() => {
    fetchData();
  }, []);

  // ২. নতুন সাবজেক্ট যোগ করার হ্যান্ডলার
      const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newSubjectName.trim()) {
          return alert("দয়া করে সাবজেক্টের নাম লিখুন!");
        }

        // selectedClassGroupId এর সঠিক মান নেওয়া নিশ্চিত করুন
        let targetClassId = selectedClassGroupId ? Number(selectedClassGroupId) : null;

        if (!targetClassId && classList.length > 0) {
          targetClassId = Number(classList[0].id || classList[0].Id);
        }

        if (!targetClassId) {
          return alert("ডাটাবেজ থেকে কোনো Class পাওয়া যায়নি! ড্রপডাউন রিফ্রেশ করুন।");
        }

        const payload = {
          name: newSubjectName.trim(),
          classGroupId: targetClassId // ডাটাবেজে থাকা প্রকৃত ID (যেমন: 9, 10) পাঠানো হবে
        };

        console.log("Sending Payload to API:", payload); // ব্রাউজারের F12 Console-এ চেক করতে পারবেন

        try {
          const token = localStorage.getItem("token");
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          };

          await axios.post(`${API_BASE_URL}/api/Admin/subjects`, payload, config);

          alert("সাবজেক্ট সফলভাবে যোগ করা হয়েছে!");
          setNewSubjectName("");
          fetchData(); 
        } catch (err: any) {
          console.error("Add Subject Error Details:", err.response?.data || err.message);
          const errorMessage = err.response?.data?.message || err.response?.data || "সাবজেক্ট যোগ করতে ব্যর্থ হয়েছে।";
          alert(`ত্রুটি: ${typeof errorMessage === "string" ? errorMessage : "Class ID ডাটাবেজে পাওয়া যায়নি।"}`);
        }
      };
      // Class Add Function
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return alert("Please enter class name.");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5074/api/Admin/classes",
        { name: newClassName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("নতুন ক্লাস সফলভাবে তৈরি হয়েছে!");
      setNewClassName("");
      fetchData(); // আপনার ডাটা রিফ্রেশ ফাংশন কল করুন
    } catch (err: any) {
      alert(err.response?.data?.message || "ক্লাস তৈরি করতে সমস্যা হয়েছে।");
    }
  };

  //password create ---------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5074/api/Admin/change-password",
        {
          currentPassword,
          newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.response?.data?.message || "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।");
    }
  };
  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 max-w-xl mx-auto">
  <h3 className="text-xl font-semibold text-white mb-6">Application Settings & Security</h3>
  
  <form onSubmit={handleChangePassword} className="space-y-4">
    <div>
      <label className="block text-xs text-slate-400 mb-1">Current Password</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        className="w-full bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
      />
    </div>

    <div>
      <label className="block text-xs text-slate-400 mb-1">New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="w-full bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
      />
    </div>

    <div>
      <label className="block text-xs text-slate-400 mb-1">Confirm New Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="w-full bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl transition mt-4"
    >
      Update Password
    </button>
  </form>
</div>

  // Class Delete Function
  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5074/api/Admin/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("ক্লাস সফলভাবে মুছে ফেলা হয়েছে!");
      fetchData(); // আপনার ডাটা রিফ্রেশ ফাংশন কল করুন
    } catch (err: any) {
      alert(err.response?.data?.message || "ক্লাস ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  // ৩. টিচার অ্যাসাইন করার হ্যান্ডলার
  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSubjectId || !selectedClass) {
      return alert("সবগুলো ফিল্ড সঠিকভাবে পুরণ করুন!");
    }

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        teacherId: parseInt(selectedTeacherId),
        subjectId: parseInt(selectedSubjectId),
        className: selectedClass
      };

      await axios.post(`${API_BASE_URL}/api/Admin/assign-teacher`, payload, config);
      alert("টিচার সফলভাবে অ্যাসাইন করা হয়েছে!");
      setSelectedTeacherId("");
      setSelectedSubjectId("");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "টিচার অ্যাসাইন করতে ব্যর্থ হয়েছে।");
    }
  };

  // ৪. ইউজার ডিলিট করার হ্যান্ডলার
    const handleDeleteUser = async (id: number) => {
      if (!confirm("আপনি কি নিশ্চিত যে এই ইউজারকে ডিলিট করতে চান?")) return;

      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        await axios.delete(`${API_BASE_URL}/api/Admin/users/${id}`, config);
        alert("ইউজার ডিলিট হয়েছে!");
        fetchData();
      } catch (err) {
        alert("ইউজার ডিলিট করতে সমস্যা হয়েছে।");
      }
    };
    //Manage Users-------------
    const handleRoleChange = async (userId: number, newRole: string) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5074/api/Admin/users/${userId}/role`,
          { role: parseInt(newRole) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("ইউজারের রোল সফলভাবে পরিবর্তন করা হয়েছে!");

        // 👈 fetchUsers(); এর বদলে এটি ব্যবহার করুন
        setUsers((prevUsers: any[]) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, role: parseInt(newRole) } : u
          )
        );
      } catch (err: any) {
        alert(err.response?.data?.message || "রোল আপডেট করতে সমস্যা হয়েছে।");
      }
    };

  <table className="w-full text-left border-collapse">
  <thead>
    <tr className="border-b border-slate-800 text-slate-400 text-xs">
      <th className="py-3 px-4">NAME</th>
      <th className="py-3 px-4">EMAIL</th>
      <th className="py-3 px-4">ROLE</th>
      <th className="py-3 px-4 text-right">ACTION</th>
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 text-sm">
        <td className="py-3 px-4 text-white">{u.name}</td>
        <td className="py-3 px-4 text-slate-400">{u.email}</td>
        <td className="py-3 px-4">
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="0">Admin</option>
            <option value="1">Student</option>
            <option value="2">Teacher</option>
          </select>
        </td>
        <td className="py-3 px-4 text-right">
          <button
            onClick={() => handleDeleteUser(u.id)}
            className="text-rose-400 hover:text-rose-300 text-xs bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

  // ৫. সাবজেক্ট ডিলিট করার হ্যান্ডলার
  const handleDeleteSubject = async (id: number) => {
    if (!confirm("আপনি কি এই সাবজেক্টটি ডিলিট করতে চান?")) return;

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`${API_BASE_URL}/api/Admin/subjects/${id}`, config);
      alert("সাবজেক্ট ডিলিট হয়েছে!");
      fetchData();
    } catch (err) {
      alert("সাবজেক্ট ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const getRoleBadge = (role: any) => {
    const roleStr = String(role || "").toLowerCase();
    if (roleStr.includes("admin") || roleStr === "1") {
      return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Admin</span>;
    } else if (roleStr.includes("teacher") || roleStr === "2") {
      return <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Teacher</span>;
    }
    return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Student</span>;
  };

  const teachersList = users.filter(u => {
    const r = String(u.role).toLowerCase();
    return r.includes("teacher") || r === "2";
  });

  return (
    <ProtectedRoute allowedRole="Admin">
      <div className="min-h-screen bg-slate-950 text-white pb-12">
        <Navbar 
          title="Admin Control Center" 
          subtitle="Hello! Welcome back to your assignment control center." 
        />

        <div className="max-w-6xl mx-auto px-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Total Users</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400">
                {loading ? "..." : `${users.length} Users`}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Active Subjects</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                {loading ? "..." : `${subjects.length} Subjects`}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-slate-400 text-xs">Total Assignments</p>
              <h3 className="text-2xl font-bold mt-1 text-sky-400">
                {loading ? "..." : `${assignmentsCount} Total`}
              </h3>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "users" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "subjects" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Manage Subjects
            </button>
            <button
              onClick={() => setActiveTab("assign")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "assign" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Assign Teachers
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "assignments" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              All Assignments
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === "submissions" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Submissions
            </button>
          </div>

          {/* 1. Manage Users Tab */}
          {activeTab === "users" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-mono">{u.id}</td>
                        <td className="p-3 font-medium text-white">{u.fullName || u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-[11px] transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Manage Subjects Tab */}
          {activeTab === "subjects" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-white">Subjects List</h2>

                <form onSubmit={handleAddSubject} className="flex gap-2">
                  {classList.length > 0 && (
                  <select
                    value={selectedClassGroupId}
                    onChange={(e) => setSelectedClassGroupId(e.target.value)}
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {classList.map((cls) => {
                      const classId = cls.id || cls.Id;
                      return (
                        <option key={classId} value={classId}>
                          {cls.name || cls.Name || `Class ${classId}`}
                        </option>
                      );
                    })}
                  </select>
                  )}

                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
                  >
                    + Add Subject
                  </button>
                </form>

              </div>

              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <p className="text-xs text-slate-400">কোনো সাবজেক্ট পাওয়া যায়নি।</p>
                ) : (
                  subjects.map((s, index) => {
                    const name = typeof s === 'string' ? s : s.name || s.subjectName || `Subject #${index + 1}`;
                    return (
                      <div key={s.id || index} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                        <p className="font-bold text-white text-sm">{name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">Active</span>
                          {s.id && (
                            <button
                              onClick={() => handleDeleteSubject(s.id)}
                              className="text-red-400 hover:text-red-300 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 3. Assign Teacher Tab */}
          {activeTab === "assign" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-bold">Assign Teacher to Class & Subject</h2>
              
              <form onSubmit={handleAssignTeacher} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName || t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((s, idx) => (
                      <option key={s.id || idx} value={s.id}>
                        {s.name || s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded text-xs transition cursor-pointer"
                  >
                    Assign Now
                  </button>
                </div>
              </form>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3">Assigned Teachers List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">Teacher</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {teacherAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            এখনো কোনো টিচার অ্যাসাইন করা হয়নি।
                          </td>
                        </tr>
                      ) : (
                        teacherAssignments.map((ta) => (
                          <tr key={ta.id}>
                            <td className="p-3 font-medium text-white">{ta.teacherName}</td>
                            <td className="p-3 text-indigo-400 font-semibold">{ta.subjectName}</td>
                            <td className="p-3"><span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400">{ta.className}</span></td>
                            <td className="p-3 text-slate-400">{new Date(ta.assignedAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
           {/* class submit and admin------------ */}
    
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Class/Course</h3>
            <form onSubmit={handleAddClass} className="flex gap-4">
              <input
                type="text"
                placeholder="e.g., Class 11 or Science Group"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 flex-1"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2 rounded-xl transition"
              >
                Add Class
              </button>
            </form>
          </div>

          {/* 4. All Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">All Created Assignments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Teacher</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-center">Total Submissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allAssignments.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-500">কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।</td></tr>
                    ) : (
                      allAssignments.map((a) => (
                        <tr key={a.id}>
                          <td className="p-3 font-medium text-white">{a.title}</td>
                          <td className="p-3 text-slate-300">{a.teacherName}</td>
                          <td className="p-3"><span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">{a.subjectName}</span></td>
                          <td className="p-3 text-slate-400">{new Date(a.dueDate).toLocaleDateString()}</td>
                          <td className="p-3 text-center font-bold text-emerald-400">{a.submissionsCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Student Submissions Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Assignment Title</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3 text-right">Grade Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allSubmissions.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-slate-500">কোনো সাবমিশন ডাটা নেই।</td></tr>
                    ) : (
                      allSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="p-3 font-medium text-white">{sub.studentName}</td>
                          <td className="p-3 text-slate-300">{sub.assignmentTitle}</td>
                          <td className="p-3 text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            {sub.grade ? (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold">
                                Grade: {sub.grade}
                              </span>
                            ) : (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded">
                                Pending Grade
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}