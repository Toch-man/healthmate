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
  location: string;
  status: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  state: string;
  status: string;
}

interface Stats {
  total_users: number;
  total_doctors: number;
  total_hospitals: number;
  total_appointments: number;
  pending_doctors: number;
  pending_hospitals: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { auth_fetch, logout } = useAuth();
  const [pending_doctors, set_pending_doctors] = useState<Doctor[]>([]);
  const [pending_hospitals, set_pending_hospitals] = useState<Hospital[]>([]);
  const [stats, set_stats] = useState<Stats | null>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [docs_res, hosp_res, users_res] = await Promise.all([
          auth_fetch(`/api/admin/pending_doctors`),
          auth_fetch(`/api/admin/pending_hospitals`),
          auth_fetch(`/api/admin/users`),
        ]);

        const docs_data = await docs_res.json();
        const hosp_data = await hosp_res.json();
        const users_data = await users_res.json();

        set_pending_doctors(docs_data.data || []);
        set_pending_hospitals(hosp_data.data || []);
        set_stats({
          total_users: users_data.data?.length || 0,
          total_doctors:
            users_data.data?.filter((u: any) => u.role === "DOCTOR").length ||
            0,
          total_hospitals:
            users_data.data?.filter((u: any) => u.role === "HOSPITAL").length ||
            0,
          total_appointments: 0,
          pending_doctors: docs_data.data?.length || 0,
          pending_hospitals: hosp_data.data?.length || 0,
        });
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };

    fetch_data();
  }, []);

  const handle_logout = async () => {
    logout();
    router.push("/auth/login");
  };

  const handle_doctor_status = async (id: string, status: string) => {
    try {
      await auth_fetch(`/api/admin/doctor_status/${id}`, {
        method: "PATCH",

        body: JSON.stringify({ status }),
      });
      set_pending_doctors((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Something went wrong");
    }
  };

  const handle_hospital_status = async (id: string, status: string) => {
    try {
      await auth_fetch(`/api/admin/hospital_status/${id}`, {
        method: "PATCH",

        body: JSON.stringify({ status }),
      });
      set_pending_hospitals((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert("Something went wrong");
    }
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/admin/dashboard", active: true },
    { label: "Doctors", icon: "🩺", href: "/admin/doctors" },
    { label: "Hospitals", icon: "🏥", href: "/admin/hospitals" },
    { label: "Patients", icon: "👥", href: "/admin/patients" },
    { label: "Appointments", icon: "📅", href: "/admin/appointments" },
    { label: "Settings", icon: "⚙️", href: "/admin/settings" },
  ];

  const date_str = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
              }}
            >
              SA
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
                Super Admin
              </div>
              <div style={{ fontSize: 11, color: "#5C78B0" }}>Admin</div>
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
              Admin overview
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {date_str}
            </div>
          </div>
          <Link
            href="/admin/notifications"
            style={{ textDecoration: "none", fontSize: 22 }}
          >
            🔔
          </Link>
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
              label: "Total users",
              value: stats?.total_users || 0,
              sub: "All roles",
              color: "#1B2B6B",
            },
            {
              label: "Active doctors",
              value: stats?.total_doctors || 0,
              sub: `${stats?.pending_doctors || 0} pending`,
              color: "#0F6E56",
            },
            {
              label: "Hospitals",
              value: stats?.total_hospitals || 0,
              sub: `${stats?.pending_hospitals || 0} pending`,
              color: "#EF9F27",
            },
            {
              label: "Appointments",
              value: stats?.total_appointments || 0,
              sub: "This month",
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

        {/* Content */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {/* Pending doctors */}
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
                Pending doctors
              </div>
              {pending_doctors.length > 0 && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: "#FAEEDA",
                    color: "#633806",
                  }}
                >
                  {pending_doctors.length} pending
                </span>
              )}
            </div>

            {pending_doctors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  No pending doctors
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending_doctors.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
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
                      {doc.first_name[0]}
                      {doc.last_name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        Dr. {doc.first_name} {doc.last_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        {doc.specialization} · {doc.location}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handle_doctor_status(doc.id, "APPROVED")}
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
                        onClick={() => handle_doctor_status(doc.id, "REJECTED")}
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
                {pending_doctors.length > 4 && (
                  <Link
                    href="/admin/doctors"
                    style={{
                      fontSize: 12,
                      color: "#1B2B6B",
                      textDecoration: "none",
                      textAlign: "center",
                      padding: "8px 0",
                      display: "block",
                    }}
                  >
                    View {pending_doctors.length - 4} more →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Pending hospitals */}
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
                  Pending hospitals
                </div>
                {pending_hospitals.length > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: "#FAEEDA",
                      color: "#633806",
                    }}
                  >
                    {pending_hospitals.length} pending
                  </span>
                )}
              </div>

              {pending_hospitals.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    No pending hospitals
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {pending_hospitals.slice(0, 3).map((hosp) => (
                    <div
                      key={hosp.id}
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
                          borderRadius: 8,
                          background: "#EEEDFE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        🏥
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {hosp.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {hosp.address}, {hosp.state}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() =>
                            handle_hospital_status(hosp.id, "APPROVED")
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
                            handle_hospital_status(hosp.id, "REJECTED")
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

            {/* Platform summary */}
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
                Platform summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    label: "Patients",
                    value:
                      (stats?.total_users || 0) -
                      (stats?.total_doctors || 0) -
                      (stats?.total_hospitals || 0),
                  },
                  { label: "Doctors", value: stats?.total_doctors || 0 },
                  { label: "Hospitals", value: stats?.total_hospitals || 0 },
                  {
                    label: "Pending approvals",
                    value:
                      (stats?.pending_doctors || 0) +
                      (stats?.pending_hospitals || 0),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderTop: "0.5px solid #e5e7eb",
                  marginTop: 12,
                  paddingTop: 10,
                }}
              >
                <Link
                  href="/admin/users"
                  style={{
                    fontSize: 12,
                    color: "#1B2B6B",
                    textDecoration: "none",
                  }}
                >
                  View all users →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
