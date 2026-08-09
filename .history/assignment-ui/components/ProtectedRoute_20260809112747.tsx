"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "Teacher" | "Student";
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // লগইনের সময় LocalStorage-এ সেভ করা রোল

    // ১. টোকেন না থাকলে সরাসরি লগইন পেজে পাঠাবে
    if (!token) {
      router.push("/login");
      return;
    }

    // ২. নির্দিষ্ট রোল না মিললে তার নিজের ড্যাশবোর্ডে রিডাইরেক্ট করবে
    if (allowedRole && role !== allowedRole) {
      if (role === "Teacher") {
        router.push("/teacher/dashboard");
      } else if (role === "Student") {
        router.push("/student/dashboard");
      } else {
        router.push("/login");
      }
      return;
    }

    setAuthorized(true);
  }, [router, allowedRole]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        <div className="animate-pulse">Checking authorization...</div>
      </div>
    );
  }

  return <>{children}</>;
}