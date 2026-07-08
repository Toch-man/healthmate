"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth_context";
type Role = "PATIENT" | "DOCTOR" | "HOSPITAL";

export default function SignupPage() {
  const { auth_fetch } = useAuth();
  const [role, set_role] = useState<Role>("PATIENT");
  const [loading, set_loading] = useState(false);
  const [show_password, set_show_password] = useState(false);
  const [form, set_form] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    specialization: "",
    yearsExperience: "",
    location: "",
    licenseNumber: "",
    name: "",
    address: "",
    state: "",
    license_number: "",
  });

  const handle_change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    set_form({ ...form, [e.target.name]: e.target.value });
  };

  const handle_submit = async () => {
    set_loading(true);
    const endpoint =
      role === "PATIENT"
        ? "/api/auth/patient_signup"
        : role === "DOCTOR"
          ? "/api/auth/doctor_signup"
          : "/api/auth/hospital_signup";

    try {
      const res = await auth_fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      window.location.href =
        role === "PATIENT"
          ? "/patient/dashboard"
          : `/${role.toLowerCase()}/dashboard`;
    } catch {
      alert("Something went wrong");
    } finally {
      set_loading(false);
    }
  };

  const roles: { key: Role; label: string; icon: string }[] = [
    { key: "PATIENT", label: "Patient", icon: "👤" },
    { key: "DOCTOR", label: "Doctor", icon: "🩺" },
    { key: "HOSPITAL", label: "Hospital", icon: "🏥" },
  ];

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
  };

  const label_style = {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left */}
      <div
        style={{
          width: 260,
          background: "#1B2B6B",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#fff",
              marginBottom: "3rem",
            }}
          >
            Kizito<span style={{ color: "#4DD9C0" }}>Health</span>
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#fff",
              lineHeight: 1.4,
              margin: "0 0 0.75rem",
            }}
          >
            Start understanding your health today
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#93A8D4",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            AI diagnosis + real doctors. Free to get started.
          </p>
        </div>
        <p style={{ fontSize: 11, color: "#5C78B0", margin: 0 }}>
          © 2026 KizitoHealth
        </p>
      </div>

      {/* Right */}
      <div
        style={{
          flex: 1,
          padding: "2rem 3rem",
          overflowY: "auto",
          background: "#fff",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.25rem" }}>
            Create your account
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 1.5rem" }}>
            Already have one?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#1B2B6B",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={label_style}>I am a</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {roles.map((r) => (
                <div
                  key={r.key}
                  onClick={() => set_role(r.key)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: 8,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    border:
                      role === r.key
                        ? "0.5px solid #1B2B6B"
                        : "0.5px solid #e5e7eb",
                    background: role === r.key ? "#E6F1FB" : "#fff",
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: role === r.key ? "#1B2B6B" : "#6b7280",
                    }}
                  >
                    {r.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common fields */}
          {role !== "HOSPITAL" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={label_style}>First name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="Tochukwu"
                />
              </div>
              <div>
                <label style={label_style}>Last name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="Okeakpu"
                />
              </div>
            </div>
          )}

          {role === "HOSPITAL" && (
            <div style={{ marginBottom: 12 }}>
              <label style={label_style}>Hospital name</label>
              <input
                name="name"
                value={form.name}
                onChange={handle_change}
                style={input_style}
                placeholder="Lagos General Hospital"
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={label_style}>Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle_change}
              style={input_style}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={label_style}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={show_password ? "text" : "password"}
                value={form.password}
                onChange={handle_change}
                style={{ ...input_style, paddingRight: 40 }}
                placeholder="Min. 8 characters"
              />
              <button
                onClick={() => set_show_password(!show_password)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                {show_password ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Patient fields */}
          {role === "PATIENT" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={label_style}>Date of birth</label>
                  <input
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={handle_change}
                    style={input_style}
                  />
                </div>
                <div>
                  <label style={label_style}>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handle_change}
                    style={input_style}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHERS">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label_style}>Phone number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </>
          )}

          {/* Doctor fields */}
          {role === "DOCTOR" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={label_style}>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handle_change}
                    style={input_style}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHERS">Other</option>
                  </select>
                </div>
                <div>
                  <label style={label_style}>Phone number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handle_change}
                    style={input_style}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label_style}>Specialization</label>
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={label_style}>Years of experience</label>
                  <input
                    name="yearsExperience"
                    type="number"
                    value={form.yearsExperience}
                    onChange={handle_change}
                    style={input_style}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label style={label_style}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handle_change}
                    style={input_style}
                    placeholder="Lagos, Nigeria"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label_style}>License number</label>
                <input
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="MDCN/R/0000"
                />
              </div>
            </>
          )}

          {/* Hospital fields */}
          {role === "HOSPITAL" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={label_style}>Phone number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handle_change}
                    style={input_style}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div>
                  <label style={label_style}>State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handle_change}
                    style={input_style}
                    placeholder="Lagos"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label_style}>Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="123 Hospital Road"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label_style}>License number</label>
                <input
                  name="license_number"
                  value={form.license_number}
                  onChange={handle_change}
                  style={input_style}
                  placeholder="HSP/LAG/0000"
                />
              </div>
            </>
          )}

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
              marginTop: 4,
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "1.25rem 0",
            }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
            <div style={{ flex: 1, height: "0.5px", background: "#e5e7eb" }} />
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              color: "#111",
              textDecoration: "none",
              background: "#fff",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24">
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

          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              textAlign: "center",
              marginTop: "1rem",
              lineHeight: 1.6,
            }}
          >
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              style={{ color: "#1B2B6B", textDecoration: "none" }}
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              style={{ color: "#1B2B6B", textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
