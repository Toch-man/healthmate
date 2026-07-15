"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface PatientProfile {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  language: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export default function PatientProfilePage() {
  const router = useRouter();
  const { auth_fetch, user, logout } = useAuth();

  const [loading, set_loading] = useState(true);
  const [saving, set_saving] = useState(false);
  const [success, set_success] = useState(false);
  const [form, set_form] = useState<PatientProfile>({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    language: "English",
    allergies: [],
    medications: [],
    conditions: [],
  });
  const [tag_inputs, set_tag_inputs] = useState({
    allergies: "",
    medications: "",
    conditions: "",
  });

  useEffect(() => {
    const fetch_profile = async () => {
      try {
        if (user!.patient) set_form(user!.patient);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_profile();
  }, []);

  // useCallback — prevents handle_change from being recreated on every render
  const handle_change = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      set_form((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  // useCallback — add tag to array field
  const add_tag = useCallback(
    (field: "allergies" | "medications" | "conditions") => {
      const value = tag_inputs[field].trim();
      if (!value) return;
      set_form((prev) => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field]
          : [...prev[field], value],
      }));
      set_tag_inputs((prev) => ({ ...prev, [field]: "" }));
    },
    [tag_inputs],
  );

  // useCallback — remove tag from array field
  const remove_tag = useCallback(
    (field: "allergies" | "medications" | "conditions", value: string) => {
      set_form((prev) => ({
        ...prev,
        [field]: prev[field].filter((v) => v !== value),
      }));
    },
    [],
  );

  // useMemo — only recompute initials when name changes
  const initials = useMemo(
    () =>
      `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase(),
    [form.first_name, form.last_name],
  );

  const handle_save = async () => {
    set_saving(true);
    try {
      const res = await auth_fetch(`/api/patients/update_profile`, {
        method: "PATCH",

        body: JSON.stringify(form),
      });
      if (res.ok) {
        set_success(true);
        setTimeout(() => set_success(false), 3000);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      set_saving(false);
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
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/dashboard/patient" },
    {
      label: "Symptom check",
      icon: "🩺",
      href: "/dashboard/patient/symptom-check",
    },
    {
      label: "Appointments",
      icon: "📅",
      href: "/dashboard/patient/appointments",
    },
    { label: "Health records", icon: "📋", href: "/dashboard/patient/records" },
    {
      label: "Notifications",
      icon: "🔔",
      href: "/dashboard/patient/notifications",
    },
    {
      label: "Profile",
      icon: "👤",
      href: "/dashboard/patient/profile",
      active: true,
    },
  ];

  if (loading)
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
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const tag_section = (
    label: string,
    field: "allergies" | "medications" | "conditions",
    placeholder: string,
  ) => (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 6,
          display: "block",
        }}
      >
        {label}
      </label>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
      >
        {form[field].map((v) => (
          <span
            key={v}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              padding: "4px 10px",
              background: "#E6F1FB",
              borderRadius: 20,
              color: "#0C447C",
            }}
          >
            {v}
            <button
              onClick={() => remove_tag(field, v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "#0C447C",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={tag_inputs[field]}
          onChange={(e) =>
            set_tag_inputs((prev) => ({ ...prev, [field]: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add_tag(field);
            }
          }}
          placeholder={placeholder}
          style={{ ...input_style, flex: 1 }}
        />
        <button
          onClick={() => add_tag(field)}
          style={{
            padding: "10px 14px",
            background: "#1B2B6B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: 220,
          background: "#1B2B6B",
          minHeight: "100vh",
          padding: "1.5rem 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#fff",
            padding: "0 1.25rem 1.5rem",
            borderBottom: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          Health<span style={{ color: "#4DD9C0" }}>Mate</span>
        </div>
        <div style={{ padding: "1rem 0", flex: 1 }}>
          {nav_items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 1.25rem",
                fontSize: 13,
                textDecoration: "none",
                color: item.active ? "#fff" : "#93A8D4",
                background: item.active
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                borderLeft: item.active
                  ? "2px solid #4DD9C0"
                  : "2px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, background: "#f9fafb", padding: "1.75rem" }}>
        <div style={{ maxWidth: 640 }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.75rem",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 500 }}>Profile</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {success && (
                <span
                  style={{
                    fontSize: 13,
                    color: "#085041",
                    background: "#E1F5EE",
                    padding: "6px 12px",
                    borderRadius: 8,
                  }}
                >
                  ✓ Saved successfully
                </span>
              )}
              <button
                onClick={handle_save}
                disabled={saving}
                style={{
                  padding: "9px 20px",
                  background: saving ? "#9ca3af" : "#1B2B6B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#1B2B6B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 500,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials || "?"}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                {form.first_name} {form.last_name}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 12, color: "#4DD9C0", marginTop: 2 }}>
                Patient
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginBottom: "1rem",
                color: "#111",
              }}
            >
              Personal information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  First name
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handle_change}
                  style={input_style}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Last name
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handle_change}
                  style={input_style}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handle_change}
                  placeholder="+234 800 000 0000"
                  style={input_style}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Date of birth
                </label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handle_change}
                  style={input_style}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Gender
                </label>
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
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Preferred language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handle_change}
                  style={input_style}
                >
                  <option value="English">English</option>
                  <option value="Yoruba">Yoruba</option>
                  <option value="Igbo">Igbo</option>
                  <option value="Hausa">Hausa</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical info */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginBottom: "1rem",
                color: "#111",
              }}
            >
              Medical information
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Blood group
              </label>
              <select
                name="blood_group"
                value={form.blood_group}
                onChange={handle_change}
                style={{ ...input_style, width: "50%" }}
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ),
                )}
              </select>
            </div>
            {tag_section("Allergies", "allergies", "e.g. Penicillin, Peanuts")}
            {tag_section(
              "Current medications",
              "medications",
              "e.g. Metformin 500mg",
            )}
            {tag_section(
              "Existing conditions",
              "conditions",
              "e.g. Hypertension, Diabetes",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
