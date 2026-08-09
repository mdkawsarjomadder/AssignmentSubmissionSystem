"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";

export default function ProfilePage() {
  const [role, setRole] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // LocalStorage থেকে বিদ্যমান প্রোফাইল ডাটা লোড করা
    const storedRole = localStorage.getItem("role") || "";
    const storedName = localStorage.getItem("fullName") || "User Name";
    const storedPhone = localStorage.getItem("phone") || "";
    const storedAddress = localStorage.getItem("address") || "";
    const storedImage = localStorage.getItem("profileImage") || null;

    setRole(storedRole);
    setFullName(storedName);
    setPhone(storedPhone);
    setAddress(storedAddress);
    setImagePreview(storedImage);
  }, []);

  // ইমেজ ফাইল সিলেক্ট ও প্রিভিউ হ্যান্ডলার
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // প্রোফাইল সেভ হ্যান্ডলার
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // LocalStorage-এ আপডেট ডেটা রাখা
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("phone", phone);
      localStorage.setItem("address", address);
      if (imagePreview) {
        localStorage.setItem("profileImage", imagePreview);
      }

      // API তে আপডেট রিকোয়েস্ট পাঠানোর সুযোগ (যদি ব্যাকএন্ডে এন্ডপয়েন্ট থাকে)
      const token = localStorage.getItem("token");
      if (token) {
        await axios.put(
          "http://localhost:5074/api/Auth/profile",
          { fullName, phone, address, profileImage: imagePreview },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {
          // API প্রস্তুত না থাকলে ইগনোর করবে
        });
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center items-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl transition-all">
          
          {/* Header & Avatar */}
          <div className="flex items-center space-x-5 mb-6 pb-6 border-b border-slate-800">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-indigo-500/50 shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()
                )}
              </div>
              
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition text-xs font-semibold text-white">
                  Change
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{fullName || "User Profile"}</h2>
              <p className="text-xs text-slate-400 capitalize mt-1">
                Role: <span className="text-indigo-400 font-semibold">{role}</span>
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {message && (
            <div className="mb-4 text-xs p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-medium">
              {message}
            </div>
          )}

          {/* View / Edit Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 text-sm"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Full Name</span>
                <span className="font-medium text-slate-200">{fullName || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-medium text-slate-200">{phone || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Address</span>
                <span className="font-medium text-slate-200">{address || "Not provided"}</span>
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