"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DoctorProfile {
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  specialization: string;
  yearsExperience: number;
  location: string;
  bio: string;
  licenseNumber: string;
  available: boolean;
  status: string;
  rating: number;
  totalRatings: number;
}

interface User {
  email: string;
  doctor: DoctorProfile;
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const [user, set_user] = useState<User | null>(null);
  const [loading, set_loading] = useState(true);
  const [saving, set_saving] = useState(false);
  const [success, set_success] = useState(false);
  const [form, set_form] = useState<DoctorProfile>({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
    specialization: "",
    yearsExperience: 0,
    location: "",
    bio: "",
    licenseNumber: "",
    available: true,
    status: "",
    rating: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    const fetch_profile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          { credentials: "include" },
        );
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        set_user(data.user);
        if (data.user.doctor) set_form(data.user.doctor);
      } catch {
        router.push("/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_profile();
  }, []);

  const handle_change = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      set_form((prev) => ({ ...prev, [e.target.name]: value }));
    },
    [],
  );

  const initials = useMemo(
    () =>
      `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase(),
    [form.first_name, form.last_name],
  );

  const handle_save = async () => {
    set_saving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/profile`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            bio: form.bio,
            location: form.location,
            available: form.available,
          }),
        },
      );
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
    { label: "Dashboard", icon: "🏠", href: "/doctor/dashboard" },
    { label: "Appointments", icon: "📅", href: "/doctor/appointments" },
    { label: "Patients", icon: "👥", href: "/doctor/patients" },
    { label: "Notifications", icon: "🔔", href: "/doctor/notifications" },
    { label: "Profile", icon: "👤", href: "/doctor/profile", active: true },
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
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #1B2B6B",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
                  ✓ Saved
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

          {/* Avatar + status */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                }}
              >
                {initials || "?"}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  Dr. {form.first_name} {form.last_name}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  {user?.email}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 6,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background:
                        form.status === "APPROVED" ? "#E1F5EE" : "#FAEEDA",
                      color: form.status === "APPROVED" ? "#085041" : "#633806",
                    }}
                  >
                    {form.status?.charAt(0) +
                      form.status?.slice(1).toLowerCase()}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    ⭐ {form.rating?.toFixed(1)} ({form.totalRatings} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Availability toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Available</span>
              <div
                onClick={() =>
                  set_form((prev) => ({ ...prev, available: !prev.available }))
                }
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 20,
                  cursor: "pointer",
                  background: form.available ? "#1B2B6B" : "#e5e7eb",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 3,
                    left: form.available ? 20 : 3,
                    transition: "left 0.2s",
                  }}
                />
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
              style={{ fontSize: 13, fontWeight: 500, marginBottom: "1rem" }}
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
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handle_change}
                  style={input_style}
                />
              </div>
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
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handle_change}
                rows={3}
                style={{
                  ...input_style,
                  resize: "none",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.6,
                }}
                placeholder="Tell patients about yourself..."
              />
            </div>
          </div>

          {/* Professional info (read only) */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <div
              style={{ fontSize: 13, fontWeight: 500, marginBottom: "1rem" }}
            >
              Professional information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                { label: "Specialization", value: form.specialization },
                {
                  label: "Years of experience",
                  value: `${form.yearsExperience} years`,
                },
                { label: "License number", value: form.licenseNumber },
                {
                  label: "Gender",
                  value:
                    form.gender?.charAt(0) +
                    form.gender?.slice(1).toLowerCase(),
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      padding: "10px 12px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      color: "#374151",
                    }}
                  >
                    {item.value || "—"}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                Note
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Specialization, experience and license number can only be
                changed by contacting support.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
