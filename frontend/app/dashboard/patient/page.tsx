"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface User {
  id: string;
  email: string;
  role: string;
  patient: {
    first_name: string;
    last_name: string;
    blood_group: string;
    allergies: string[];
    conditions: string[];
  };
}

interface Appointment {
  id: string;
  reason: string;
  status: string;
  scheduledAt: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

interface HealthRecord {
  id: string;
  symptoms: string[];
  diagnosis: string;
  severity: string;
  createdAt: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const { auth_fetch, user, logout } = useAuth();
  const [appointments, set_appointments] = useState<Appointment[]>([]);
  const [records, set_records] = useState<HealthRecord[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [apt_res, rec_res] = await Promise.all([
          auth_fetch(`/api/appointment/patient_appointments`),
          auth_fetch(`/api/patient/health-records`),
        ]);

        const apt_data = await apt_res.json();
        const rec_data = await rec_res.json();

        set_appointments(apt_data.data || []);
        set_records(rec_data.data || []);
      } catch (err: any) {
        console.log(`${err}`);
      } finally {
        set_loading(false);
      }
    };

    fetch_data();
  }, []);

  const handle_logout = async () => {
    await logout();
    router.push("/auth/login");
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

  const severity_badge = (severity: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      LOW: { bg: "#E1F5EE", color: "#085041" },
      MEDIUM: { bg: "#FAEEDA", color: "#633806" },
      HIGH: { bg: "#FCEBEB", color: "#A32D2D" },
      EMERGENCY: { bg: "#FDE8E8", color: "#7B1010" },
    };
    const s = map[severity] || map.LOW;
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
        {severity.charAt(0) + severity.slice(1).toLowerCase()}
      </span>
    );
  };

  const nav_items = [
    {
      label: "Dashboard",
      icon: "🏠",
      href: "/dashboard/patient",
      active: true,
    },
    {
      label: "Symptom check",
      icon: "🩺",
      href: "/dashboard/patient/symptom-check",
    },
    {
      label: "Appointments",
      icon: "📅",
      href: "/dashboard/patient/appointment",
    },
    { label: "Health records", icon: "📋", href: "/dashboard/patient/records" },
    {
      label: "Notifications",
      icon: "🔔",
      href: "/dashboard/patient/notifications",
    },
    { label: "Profile", icon: "👤", href: "/dashboard/patient/profile" },
  ];

  const sidebar_style = {
    width: 220,
    background: "#1B2B6B",
    minHeight: "100vh",
    padding: "1.5rem 0",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
    position: "sticky" as const,
    top: 0,
  };

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

  const first_name = user?.patient?.first_name || "there";
  const initials = `${user?.patient?.first_name?.[0] || ""}${user?.patient?.last_name?.[0] || ""}`;
  const upcoming = appointments.filter((a) =>
    ["PENDING", "APPROVED"].includes(a.status),
  );
  const latest_record = records[records.length - 1];

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
      <div style={sidebar_style}>
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
                {first_name}
              </div>
              <div style={{ fontSize: 11, color: "#5C78B0" }}>Patient</div>
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
              {greeting}, {first_name}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {date_str}
            </div>
          </div>
          <Link
            href="/dashboard/patient/notifications"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>🔔</span>
          </Link>
        </div>

        {/* Hero banner */}
        <div
          style={{
            background: "#1B2B6B",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#93A8D4", marginBottom: 4 }}>
              Start a symptom check
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#fff",
                marginBottom: 10,
              }}
            >
              How are you feeling today?
            </div>
            <Link
              href="/dashboard/patient/symptom-check"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#4DD9C0",
                borderRadius: 8,
                fontSize: 12,
                color: "#085041",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Check symptoms
            </Link>
          </div>
          <span style={{ fontSize: 52, opacity: 0.15 }}>🩺</span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              label: "Total appointments",
              value: appointments.length,
              sub: `${upcoming.length} upcoming`,
            },
            { label: "Health checks", value: records.length, sub: "All time" },
            {
              label: "Last check",
              value: latest_record
                ? `${Math.floor((Date.now() - new Date(latest_record.createdAt).getTime()) / 86400000)}d`
                : "—",
              sub: "ago",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "0.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 500, color: "#1B2B6B" }}>
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
          {/* Appointments */}
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
                Upcoming appointments
              </div>
              <Link
                href="/dashboard/patient/appointment"
                style={{
                  fontSize: 12,
                  color: "#1B2B6B",
                  textDecoration: "none",
                }}
              >
                View all
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  No upcoming appointments
                </div>
                <Link
                  href="/dashboard/patient/appointment/book"
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    fontSize: 12,
                    color: "#1B2B6B",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Book one →
                </Link>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {upcoming.slice(0, 3).map((apt) => (
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
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#E6F1FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#0C447C",
                        flexShrink: 0,
                      }}
                    >
                      {apt.doctor.first_name[0]}
                      {apt.doctor.last_name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        Dr. {apt.doctor.first_name} {apt.doctor.last_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        {apt.doctor.specialization} ·{" "}
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
                    {status_badge(apt.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Latest health record */}
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
                Recent health check
              </div>
              {latest_record ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Symptoms
                    </span>
                    <span style={{ fontSize: 12 }}>
                      {latest_record.symptoms.slice(0, 2).join(", ")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Severity
                    </span>
                    {severity_badge(latest_record.severity)}
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Diagnosis
                    </span>
                    <span style={{ fontSize: 12 }}>
                      {latest_record.diagnosis}
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: "0.5px solid #e5e7eb",
                      marginTop: 12,
                      paddingTop: 10,
                    }}
                  >
                    <Link
                      href={`/dashboard/patient/records/${latest_record.id}`}
                      style={{
                        fontSize: 12,
                        color: "#1B2B6B",
                        textDecoration: "none",
                      }}
                    >
                      View full result →
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🩺</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    No checks yet
                  </div>
                  <Link
                    href="/dashboard/patient/symptom-check"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      fontSize: 12,
                      color: "#1B2B6B",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Start one →
                  </Link>
                </div>
              )}
            </div>

            {/* Health summary */}
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
                Health summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Blood group
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>
                    {user?.patient?.blood_group || "—"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Allergies
                  </span>
                  <span style={{ fontSize: 12 }}>
                    {user?.patient?.allergies?.length
                      ? user.patient.allergies.slice(0, 2).join(", ")
                      : "None listed"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Conditions
                  </span>
                  <span style={{ fontSize: 12 }}>
                    {user?.patient?.conditions?.length
                      ? user.patient.conditions.slice(0, 1).join(", ")
                      : "None listed"}
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
                  href="/dashboard/patient/profile"
                  style={{
                    fontSize: 12,
                    color: "#1B2B6B",
                    textDecoration: "none",
                  }}
                >
                  Update profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
