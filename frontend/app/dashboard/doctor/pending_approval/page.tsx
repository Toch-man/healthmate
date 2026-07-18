"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [checking, set_checking] = useState(false);

  // if status flips to APPROVED while they're on this page, send them to their dashboard
  useEffect(() => {
    if (loading) return;

    const status = user?.doctor?.status || user?.hospital?.status;
    const role = user?.role;

    if (status === "APPROVED") {
      router.push(
        role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/hospital",
      );
    }
  }, [user, loading, router]);

  const handle_logout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handle_refresh = () => {
    set_checking(true);
    // simplest reliable way to re-check status: reload, which re-triggers AuthContext's /api/auth/me
    window.location.reload();
  };

  const role = user?.role;
  const status = user?.doctor?.status || user?.hospital?.status;

  const status_copy: Record<
    string,
    { title: string; body: string; icon: string }
  > = {
    PENDING: {
      icon: "⏳",
      title: "Your account is pending approval",
      body: "Our admin team is reviewing your details. This usually takes 24–48 hours. We'll notify you by email once a decision is made.",
    },
    REJECTED: {
      icon: "❌",
      title: "Your application was not approved",
      body: "Unfortunately your account application was rejected. If you believe this is a mistake, please contact our support team for clarification.",
    },
    SUSPENDED: {
      icon: "⚠️",
      title: "Your account has been suspended",
      body: "Your account has been temporarily suspended. Please contact support for more information on how to resolve this.",
    },
  };

  const copy = status_copy[status || "PENDING"] || status_copy.PENDING;

  if (loading) {
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
              width: 36,
              height: 36,
              border: "3px solid #1B2B6B",
              borderTopColor: "transparent",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: "#6b7280" }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        background: "#f9fafb",
        fontFamily: "Inter, sans-serif",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          border: "0.5px solid #e5e7eb",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#1B2B6B",
            marginBottom: "2rem",
          }}
        >
          Health<span style={{ color: "#4DD9C0" }}>Mate</span>
        </div>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              status === "REJECTED"
                ? "#FCEBEB"
                : status === "SUSPENDED"
                  ? "#FAEEDA"
                  : "#E6F1FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 1.25rem",
          }}
        >
          {copy.icon}
        </div>

        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>
          {copy.title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.6,
            marginBottom: "1.75rem",
          }}
        >
          {copy.body}
        </div>

        {role && (
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: "1.75rem",
              padding: "8px 12px",
              background: "#f9fafb",
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            Account type: {role.charAt(0) + role.slice(1).toLowerCase()}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={handle_refresh}
            disabled={checking}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1B2B6B",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: checking ? "not-allowed" : "pointer",
            }}
          >
            {checking ? "Checking..." : "Check status again"}
          </button>
          <button
            onClick={handle_logout}
            style={{
              width: "100%",
              padding: "10px",
              background: "#fff",
              color: "#6b7280",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
