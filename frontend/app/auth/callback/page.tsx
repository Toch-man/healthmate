"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth_context";
export default function CallbackPage() {
  const router = useRouter();
  const [error, set_error] = useState("");
  const { auth_fetch } = useAuth();

  useEffect(() => {
    const exchange = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        set_error("No code found. Please try logging in again.");
        return;
      }

      try {
        const res = await auth_fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange`,
          {
            method: "POST",
            body: JSON.stringify({ code }),
          },
        );

        const data = await res.json();

        // new Google user — needs to pick role
        if (!data.user.role) {
          // save temp token for set_role endpoint
          sessionStorage.setItem("temp_token", data.temp_token);
          router.push("/choose-role");
          return;
        }

        // returning user — go to their dashboard
        if (data.user.role === "PATIENT") router.push("/patient/dashboard");
        else if (data.user.role === "DOCTOR") router.push("/doctor/dashboard");
        else if (data.user.role === "HOSPITAL")
          router.push("/hospital/dashboard");
        else if (data.user.role === "ADMIN") router.push("/admin/dashboard");
      } catch {
        set_error("Something went wrong. Please try again.");
      }
    };

    exchange();
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "#FCEBEB",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              margin: "0 auto 1rem",
            }}
          >
            ❌
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 0.5rem" }}>
            Login failed
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 1.5rem" }}>
            {error}
          </p>
          <a
            href="/auth/login"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "#1B2B6B",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid #1B2B6B",
            borderTopColor: "transparent",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 14, color: "#6b7280" }}>Logging you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
