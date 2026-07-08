"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth_context";
export default function ForgotPasswordPage() {
  const [step, set_step] = useState<1 | 2>(1);
  const [email, set_email] = useState("");
  const [loading, set_loading] = useState(false);
  const { auth_fetch } = useAuth();
  const handle_submit = async () => {
    set_loading(true);
    try {
      const res = await auth_fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot_password`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );
      if (res.ok) set_step(2);
      else alert("Email not found");
    } catch {
      alert("Something went wrong");
    } finally {
      set_loading(false);
    }
  };

  const input_style = {
    width: "100%",
    padding: "10px 12px",
    border: "0.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 13,
    background: "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
    outline: "none",
    marginBottom: 16,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 380, width: "100%" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "#1B2B6B",
            marginBottom: "2.5rem",
          }}
        >
          Health<span style={{ color: "#4DD9C0" }}>mate</span>
        </div>

        {step === 1 ? (
          <>
            <div
              style={{
                width: 44,
                height: 44,
                background: "#E6F1FB",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
                fontSize: 20,
              }}
            >
              🔒
            </div>

            <h2
              style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.25rem" }}
            >
              Forgot your password?
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                margin: "0 0 1.5rem",
                lineHeight: 1.6,
              }}
            >
              No problem. Enter your email and we'll send you a reset link.
            </p>

            <label
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 4,
                display: "block",
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => set_email(e.target.value)}
              style={input_style}
              placeholder="you@example.com"
            />

            <button
              onClick={handle_submit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                background: loading ? "#6b7280" : "#1B2B6B",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 16,
              }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <div style={{ textAlign: "center" }}>
              <Link
                href="/auth/login"
                style={{
                  fontSize: 13,
                  color: "#1B2B6B",
                  textDecoration: "none",
                }}
              >
                ← Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 44,
                height: 44,
                background: "#E1F5EE",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
                fontSize: 20,
              }}
            >
              ✉️
            </div>

            <h2
              style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.25rem" }}
            >
              Check your email
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                margin: "0 0 1.5rem",
                lineHeight: 1.6,
              }}
            >
              We sent a password reset link to <strong>{email}</strong>. It
              expires in 10 minutes.
            </p>

            <div
              style={{
                background: "#f9fafb",
                borderRadius: 12,
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Didn't get it? Check your spam folder or
              </div>
              <button
                onClick={() => set_step(1)}
                style={{
                  fontSize: 13,
                  color: "#1B2B6B",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                Resend email →
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <Link
                href="/login"
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textDecoration: "none",
                }}
              >
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
