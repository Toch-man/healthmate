"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth_context";

type Role = "PATIENT" | "DOCTOR" | "HOSPITAL";

export default function ChooseRolePage() {
  const router = useRouter();
  const [role, set_role] = useState<Role | null>(null);
  const [loading, set_loading] = useState(false); // ← local loading for submit

  const { auth_fetch } = useAuth(); // ← only need auth_fetch here

  const handle_submit = async () => {
    if (!role) return;
    set_loading(true);

    const temp_token = sessionStorage.getItem("temp_token");
    if (!temp_token) {
      router.push("/auth/login");
      return;
    }

    try {
      // auth_fetch already adds API_URL — don't add it again
      const res = await auth_fetch("/api/auth/set_role", {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      sessionStorage.removeItem("temp_token");

      if (role === "PATIENT") router.push("/dashboard/patient");
      else if (role === "DOCTOR") router.push("/dashboard/doctor");
      else if (role === "HOSPITAL") router.push("/dashboard/hospital");
    } catch {
      alert("Something went wrong");
    } finally {
      set_loading(false);
    }
  };

  const roles: {
    key: Role;
    label: string;
    icon: string;
    desc: string;
    color: string;
    border: string;
  }[] = [
    {
      key: "PATIENT",
      label: "Patient",
      icon: "👤",
      desc: "Assess symptoms, book appointments and manage your health records",
      color: "#E6F1FB",
      border: "#1B2B6B",
    },
    {
      key: "DOCTOR",
      label: "Doctor",
      icon: "🩺",
      desc: "Manage appointments, view patient records and grow your practice",
      color: "#E1F5EE",
      border: "#0F6E56",
    },
    {
      key: "HOSPITAL",
      label: "Hospital",
      icon: "🏥",
      desc: "Onboard your doctors, manage appointments and your hospital profile",
      color: "#EEEDFE",
      border: "#534AB7",
    },
  ];

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
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "#1B2B6B",
            marginBottom: "2.5rem",
          }}
        >
          Health<span style={{ color: "#4DD9C0" }}>Mate</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 0.25rem" }}>
          How will you use HealthMate?
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            margin: "0 0 2rem",
            lineHeight: 1.6,
          }}
        >
          Choose your role to set up the right experience for you. This cannot
          be changed later.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: "1.5rem",
          }}
        >
          {roles.map((r) => (
            <div
              key={r.key}
              onClick={() => set_role(r.key)}
              style={{
                padding: "1.25rem",
                border:
                  role === r.key
                    ? `1.5px solid ${r.border}`
                    : "0.5px solid #e5e7eb",
                borderRadius: 12,
                cursor: "pointer",
                background: role === r.key ? r.color : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: role === r.key ? "#fff" : "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {r.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 2,
                    color: role === r.key ? r.border : "#111",
                  }}
                >
                  {r.label}
                </div>
                <div
                  style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}
                >
                  {r.desc}
                </div>
              </div>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border:
                    role === r.key
                      ? `5px solid ${r.border}`
                      : "1.5px solid #d1d5db",
                  background: "#fff",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handle_submit}
          disabled={!role || loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 14,
            fontWeight: 500,
            color: "#fff",
            background: !role || loading ? "#9ca3af" : "#1B2B6B",
            border: "none",
            borderRadius: 8,
            cursor: !role || loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Setting up your account..." : "Continue"}
        </button>

        <p
          style={{
            fontSize: 11,
            color: "#9ca3af",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          You can complete your profile after signing in
        </p>
      </div>
    </div>
  );
}
