"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Backup Data for Cancel
  const [originalData, setOriginalData] = useState({
    fullName: "",
    phone: "",
    address: "",
    imagePreview: null as string | null,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token");

      if (token) {
        const res = await axios.get("http://localhost:5074/api/Profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const nameVal = data.fullName || "Kawsar";
        const phoneVal = data.phoneNumber || "01712342313";
        const addressVal = data.address || "Mirpur Dhaka";
        const roleVal = data.role || localStorage.getItem("role") || "Teacher";
        const idVal = `USER-${data.id || "10293"}`;

        setRole(roleVal);
        setUserId(idVal);
        setFullName(nameVal);
        setPhone(phoneVal);
        setAddress(addressVal);

        setOriginalData({
          fullName: nameVal,
          phone: phoneVal,
          address: addressVal,
          imagePreview: localStorage.getItem("profileImage") || null,
        });
      } else {
        loadFromLocalStorage();
      }
    } catch (err) {
      loadFromLocalStorage();
    } finally {
      const storedImage = localStorage.getItem("profileImage") || null;
      setImagePreview(storedImage);
      setFetching(false);
    }
  };

  const loadFromLocalStorage = () => {
    const nameVal = localStorage.getItem("fullName") || "Kawsar";
    const phoneVal = localStorage.getItem("phone") || "01712342313";
    const addressVal = localStorage.getItem("address") || "Mirpur Dhaka";
    const imgVal = localStorage.getItem("profileImage") || null;

    setRole(localStorage.getItem("role") || "Teacher");
    setUserId(localStorage.getItem("userId") || "USER-10293");
    setFullName(nameVal);
    setPhone(phoneVal);
    setAddress(addressVal);

    setOriginalData({
      fullName: nameVal,
      phone: phoneVal,
      address: addressVal,
      imagePreview: imgVal,
    });
  };

  // Top Right (X) Close Handler
  const handleClose = () => {
    if (isEditing) {
      // এডিট মোডে থাকলে পরিবর্তনগুলো বাতিল হবে
      setFullName(originalData.fullName);
      setPhone(originalData.phone);
      setAddress(originalData.address);
      setImagePreview(originalData.imagePreview);
      setMessage("");
      setIsEditing(false);
    } else {
      // সাধারণ মোডে থাকলে ড্যাশবোর্ডে ফিরে যাবে
      const userRole = role.toLowerCase();
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  };

  const compressAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const scaleFactor = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setImagePreview(compressedBase64);
      };
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.put(
          "http://localhost:5074/api/Profile/update",
          { fullName, phoneNumber: phone, address },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      localStorage.setItem("fullName", fullName);
      localStorage.setItem("phone", phone);
      localStorage.setItem("address", address);
      if (imagePreview) localStorage.setItem("profileImage", imagePreview);

      setOriginalData({ fullName, phone, address, imagePreview });

      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("phone", phone);
      localStorage.setItem("address", address);
      if (imagePreview) localStorage.setItem("profileImage", imagePreview);

      setMessage("Profile updated locally!");
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
          <p className="text-slate-400 animate-pulse">Loading Profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center items-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl transition-all relative">
          
          {/* ❌ Always Visible Top Right Close (X) Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center transition cursor-pointer text-lg font-bold"
            title={isEditing ? "Cancel Editing" : "Close & Back to Dashboard"}
          >
            ✕
          </button>

          {/* Header & Avatar */}
          <div className="flex items-center space-x-5 mb-6 pb-6 border-b border-slate-800 pr-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-indigo-500/50 shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : "K"
                )}
              </div>

              {isEditing && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition text-xs font-semibold text-white">
                  Upload
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">ID: {userId}</p>
              <p className="text-xs text-slate-400 capitalize mt-1">
                Role: <span className="text-emerald-400 font-semibold">{role}</span>
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-4 text-xs p-3 rounded-lg text-center font-medium ${
              message.includes("successfully") || message.includes("locally")
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            }`}>
              {message}
            </div>
          )}

          {/* Form / Details View */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition duration-200 cursor-pointer text-sm border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Full Name</span>
                <span className="font-medium text-slate-200">{fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">User ID</span>
                <span className="font-mono text-indigo-300">{userId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-medium text-slate-200">{phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Address</span>
                <span className="font-medium text-slate-200">{address}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Account Type</span>
                <span className="font-medium text-slate-200 capitalize">{role}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}