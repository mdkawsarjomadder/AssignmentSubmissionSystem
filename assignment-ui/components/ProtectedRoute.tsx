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
    const role = localStorage.getItem("role");

    // ১. টোকেন না থাকলে সরাসরি লগইন পেজে পাঠাবে
    if (!token) {
      router.push("/login");
      return;
    }

    // ২. কেস-ইনসেনসিটিভ রোল ভ্যালিডেশন
    if (allowedRole) {
      const userRole = role?.trim().toLowerCase();
      const requiredRole = allowedRole.toLowerCase();

      if (userRole !== requiredRole) {
        if (userRole === "teacher") {
          router.push("/teacher/dashboard");
        } else if (userRole === "student") {
          router.push("/student/dashboard");
        } else {
          router.push("/login");
        }
        return;
      }
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