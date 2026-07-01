"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  rating: number;
  totalRatings: number;
  available: boolean;
  status: string;
  yearsExperience: number;
  hospital?: { name: string };
}

interface Appointment {
  id: string;
  reason: string;
  status: string;
  scheduledAt: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { auth_fetch, user, logout } = useAuth();
  const [doctor, set_doctor] = useState<Doctor | null>(null);
  const [appointments, set_appointments] = useState<Appointment[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const apt_res = await auth_fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/doctor`,
        );\
       

        
        const apt_data = await apt_res.json();

        set_doctor(user!.doctor);
        set_appointments(apt_data.data || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };

    fetch_data();
  }, []);

  const handle_logout = async () => {
   await logout()
    router.push("/auth/login");
  };

  const handle_appointment_status = async (id: string, status: string) => {
    try {
      await auth_fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments_status`,
        {
          method: "PATCH",
        
          body: JSON.stringify({ id, status }),
        },
      );
      set_appointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch {
      alert("Something went wrong");
    }
  };

  const status_badge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      APPROVED: { bg: "#E1F5EE", color: "#085041" },
      PENDING: { bg: "#FAEEDA", color: "#633806" },
      REJECTED: { bg: "#FCEBEB", color: "#A32D2D" },
      COMPLETED: { bg: "#E6F1FB", color: "#185FA5" },
      CANCELLED: { bg: "#F3F4F6", color: "#6b7280" },
    };
    const s = map[status] || map.PENDING;
    return (
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          padding: "3px 8px",
          borderRadius: 20,
          background: s.bg,
          color: s.color,
        }}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/doctor/dashboard", active: true },
    { label: "Appointments", icon: "📅", href: "/doctor/appointments" },
    { label: "Patients", icon: "👥", href: "/doctor/patients" },
    { label: "Notifications", icon: "🔔", href: "/doctor/notifications" },
    { label: "Profile", icon: "👤", href: "/doctor/profile" },
  ];

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

  const pending = appointments.filter((a) => a.status === "PENDING");
  const today = appointments.filter((a) => {
    if (!a.scheduledAt) return false;
    const d = new Date(a.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const initials = `${doctor?.first_name?.[0] || ""}${doctor?.last_name?.[0] || ""}`;
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const date_str = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar */}
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

        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 500,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
                Dr. {doctor?.first_name}
              </div>
              <div style={{ fontSize: 11, color: "#5C78B0" }}>Doctor</div>
            </div>
          </div>
          <button
            onClick={handle_logout}
            style={{
              width: "100%",
              padding: "7px",
              fontSize: 12,
              color: "#93A8D4",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: "#f9fafb", padding: "1.75rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#111" }}>
              {greeting}, Dr. {doctor?.first_name}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {date_str}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                padding: "6px 12px",
                background: doctor?.available ? "#E1F5EE" : "#FCEBEB",
                borderRadius: 20,
                fontSize: 12,
                color: doctor?.available ? "#085041" : "#A32D2D",
                fontWeight: 500,
              }}
            >
              {doctor?.available ? "● Available" : "● Unavailable"}
            </div>
            <Link
              href="/doctor/notifications"
              style={{ textDecoration: "none", fontSize: 22 }}
            >
              🔔
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              label: "Total appointments",
              value: appointments.length,
              sub: "All time",
              color: "#1B2B6B",
            },
            {
              label: "This week",
              value: appointments.filter((a) => {
                const d = new Date(a.scheduledAt);
                const now = new Date();
                const diff =
                  (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7;
              }).length,
              sub: `${pending.length} pending`,
              color: "#0F6E56",
            },
            {
              label: "Pending",
              value: pending.length,
              sub: "Need action",
              color: "#EF9F27",
            },
            {
              label: "Rating",
              value: doctor?.rating?.toFixed(1) || "—",
              sub: `${doctor?.totalRatings || 0} reviews`,
              color: "#534AB7",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "0.5px solid #e5e7eb",
                borderTop: `2px solid ${stat.color}`,
                borderRadius: 12,
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}
        >
          {/* Appointment requests */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Appointment requests
              </div>
              <Link
                href="/doctor/appointments"
                style={{
                  fontSize: 12,
                  color: "#1B2B6B",
                  textDecoration: "none",
                }}
              >
                View all
              </Link>
            </div>

            {pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  No pending requests
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      background: "#f9fafb",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#E6F1FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#0C447C",
                        flexShrink: 0,
                      }}
                    >
                      {apt.patient.first_name[0]}
                      {apt.patient.last_name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {apt.patient.first_name} {apt.patient.last_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        {apt.reason} ·{" "}
                        {apt.scheduledAt
                          ? new Date(apt.scheduledAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Time TBD"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() =>
                          handle_appointment_status(apt.id, "APPROVED")
                        }
                        style={{
                          padding: "5px 10px",
                          background: "#E1F5EE",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#085041",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handle_appointment_status(apt.id, "REJECTED")
                        }
                        style={{
                          padding: "5px 10px",
                          background: "#FCEBEB",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#A32D2D",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Today's schedule */}
            <div
              style={{
                background: "#fff",
                border: "0.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                }}
              >
                Today's schedule
              </div>
              {today.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Nothing scheduled today
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {today.map((apt) => (
                    <div
                      key={apt.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          minWidth: 44,
                          paddingTop: 2,
                        }}
                      >
                        {new Date(apt.scheduledAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: 8,
                          background: "#E6F1FB",
                          borderRadius: 8,
                          borderLeft: "2px solid #1B2B6B",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#0C447C",
                          }}
                        >
                          {apt.patient.first_name} {apt.patient.last_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#185FA5" }}>
                          {apt.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile summary */}
            <div
              style={{
                background: "#fff",
                border: "0.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                }}
              >
                Profile summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    label: "Specialization",
                    value: doctor?.specialization || "—",
                  },
                  {
                    label: "Experience",
                    value: `${doctor?.yearsExperience || 0} years`,
                  },
                  {
                    label: "Hospital",
                    value: doctor?.hospital?.name || "Independent",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 12 }}>{item.value}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Status</span>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background:
                        doctor?.status === "APPROVED" ? "#E1F5EE" : "#FAEEDA",
                      color:
                        doctor?.status === "APPROVED" ? "#085041" : "#633806",
                    }}
                  >
                    {doctor?.status?.charAt(0) +
                      (doctor?.status?.slice(1).toLowerCase() || "")}
                  </span>
                </div>
              </div>
              <div
                style={{
                  borderTop: "0.5px solid #e5e7eb",
                  marginTop: 12,
                  paddingTop: 10,
                }}
              >
                <Link
                  href="/doctor/profile"
                  style={{
                    fontSize: 12,
                    color: "#1B2B6B",
                    textDecoration: "none",
                  }}
                >
                  Edit profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
