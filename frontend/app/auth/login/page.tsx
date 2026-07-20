"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/app/context/auth_context";
import { useRouter } from "next/navigation";
import Dialog from "@/components/dialog";

export default function LoginPage() {
  const router = useRouter();
  const [show_password, set_show_password] = useState(false);

  const [form, set_form] = useState({ email: "", password: "" });
  const { auth_fetch } = useAuth();
  const [submitting, set_submitting] = useState(false);
  const [dialog, set_dialog] = useState<{
    open: boolean;
    type: "error" | "success" | "info";
    message: string;
    auto_close_ms?: number;
    on_close?: () => {};
  }>({
    open: false,
    type: "error",
    message: "",
  });

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_form({ ...form, [e.target.name]: e.target.value });
  };

  const handle_submit = async (e: React.MouseEvent) => {
    e.preventDefault();
    set_submitting(true);
    try {
      const res = await auth_fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        set_dialog({
          open: true,
          type: "error",
          message: data.message || `Error ${res.status}: could not login`,
        });
        return;
      }
      set_dialog({
        open: true,
        type: "success",
        message: "Logged in successfully! Redirecting...",
        auto_close_ms: 1500,
      });

      // redirect based on role
      if (data.user.role === "PATIENT") router.push("/dashboard/patient");
      else if (
        data.user.role === "DOCTOR" &&
        data.user.doctor.status == "APPROVED"
      )
        router.push("/dashboard/doctor");
      else if (
        data.user.role === "DOCTOR" &&
        data.user.doctor.status !== "APPROVED"
      )
        router.push("/dashboard/doctor/pending_approval");
      else if (data.user.role === "HOSPITAL")
        router.push("/dashboard/hospital");
      else if (data.user.role === "ADMIN") router.push("/dashboard/admin");
    } catch (error) {
      alert("Something went wrong");
    } finally {
      set_submitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex w-1/2 bg-[#1B2B6B] flex-col justify-between p-12">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Health<span className="text-[#4DD9C0]">Mate</span>
          </h1>
        </div>
        <div>
          <h2 className="text-white text-4xl font-semibold leading-tight mb-4">
            Your health, <br /> understood.
          </h2>
          <p className="text-blue-200 text-base">
            AI-powered symptom assessment and doctor connections — all in one
            place.
          </p>
        </div>
        <p className="text-blue-300 text-sm">
          © 2026 Healthmate. All rights reserved.
        </p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <h1 className="lg:hidden text-[#1B2B6B] text-2xl font-bold mb-8">
            Health<span className="text-[#4DD9C0]">Mate</span>
          </h1>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle_change}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#1B2B6B] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={show_password ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle_change}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => set_show_password(!show_password)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show_password ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handle_submit}
              disabled={submitting}
              className="w-full bg-[#1B2B6B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#162358] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#1B2B6B] font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Dialog
        open={dialog.open}
        type={dialog.type}
        message={dialog.message}
        auto_close_ms={dialog.auto_close_ms}
        on_close={() => set_dialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
}
