"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface Appointment {
  id: string;
  reason: string;
  status: string;
  scheduledAt: string | null;
  patient_brief: string | null;
  createdAt: string;
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    location: string;
    rating: number;
  };
  hospital: {
    id: string;
    name: string;
    address: string;
    state: string;
  } | null;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { auth_fetch } = useAuth();
  const [appointments, set_appointments] = useState<Appointment[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState("ALL");
  const [cancelling, set_cancelling] = useState<string | null>(null);

  useEffect(() => {
    const fetch_appointments = async () => {
      try {
        const res = await auth_fetch(`/api/appointments/patient_appointments`);

        const data = await res.json();
        set_appointments(data.data || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_appointments();
  }, []);

  const handle_cancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    set_cancelling(id);
    try {
      await auth_fetch(`/api/appointments/cancel_appointment${id}`, {
        method: "DELETE",
      });
      set_appointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Something went wrong");
    } finally {
      set_cancelling(null);
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
          padding: "3px 10px",
          borderRadius: 20,
          background: s.bg,
          color: s.color,
          fontWeight: 500,
        }}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
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
      active: true,
    },
    { label: "Health records", icon: "📋", href: "/dashboard/patient/records" },
    {
      label: "Notifications",
      icon: "🔔",
      href: "/dashboard/patient/notifications",
    },
    { label: "Profile", icon: "👤", href: "/dashboard/patient/profile" },
  ];

  const filters = [
    "ALL",
    "PENDING",
    "APPROVED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ];

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

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
              Appointments
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {appointments.length} total ·{" "}
              {appointments.filter((a) => a.status === "PENDING").length}{" "}
              pending
            </div>
          </div>
          <Link
            href="/patient/appointments/book"
            style={{
              padding: "9px 18px",
              background: "#1B2B6B",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            + Book appointment
          </Link>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => set_filter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                cursor: "pointer",
                border: "0.5px solid",
                borderColor: filter === f ? "#1B2B6B" : "#e5e7eb",
                background: filter === f ? "#1B2B6B" : "#fff",
                color: filter === f ? "#fff" : "#6b7280",
                fontWeight: filter === f ? 500 : 400,
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== "ALL" && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  ({appointments.filter((a) => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Appointments list */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              background: "#fff",
              borderRadius: 12,
              border: "0.5px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              No {filter === "ALL" ? "" : filter.toLowerCase()} appointments
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              {filter === "ALL"
                ? "You haven't booked any appointments yet"
                : `No appointments with ${filter.toLowerCase()} status`}
            </div>
            <Link
              href="/patient/appointments/book"
              style={{
                display: "inline-block",
                padding: "9px 20px",
                background: "#1B2B6B",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((apt) => (
              <div
                key={apt.id}
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
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#E6F1FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#0C447C",
                        flexShrink: 0,
                      }}
                    >
                      {apt.doctor.first_name[0]}
                      {apt.doctor.last_name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>
                        Dr. {apt.doctor.first_name} {apt.doctor.last_name}
                      </div>
                      <div
                        style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}
                      >
                        {apt.doctor.specialization} · {apt.doctor.location}
                      </div>
                    </div>
                  </div>
                  {status_badge(apt.status)}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    padding: "12px 0",
                    borderTop: "0.5px solid #f3f4f6",
                    borderBottom: "0.5px solid #f3f4f6",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}
                    >
                      Reason
                    </div>
                    <div style={{ fontSize: 13 }}>{apt.reason}</div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}
                    >
                      Scheduled
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {apt.scheduledAt
                        ? new Date(apt.scheduledAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "To be confirmed"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}
                    >
                      Hospital
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {apt.hospital?.name || "Independent"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    Booked{" "}
                    {new Date(apt.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/patient/appointments/${apt.id}`}
                      style={{
                        padding: "6px 14px",
                        border: "0.5px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#374151",
                        textDecoration: "none",
                      }}
                    >
                      View details
                    </Link>
                    {["PENDING", "APPROVED"].includes(apt.status) && (
                      <button
                        onClick={() => handle_cancel(apt.id)}
                        disabled={cancelling === apt.id}
                        style={{
                          padding: "6px 14px",
                          background: "#FCEBEB",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#A32D2D",
                          cursor:
                            cancelling === apt.id ? "not-allowed" : "pointer",
                        }}
                      >
                        {cancelling === apt.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                    {apt.status === "COMPLETED" && (
                      <Link
                        href={`/patient/appointments/${apt.id}/rate`}
                        style={{
                          padding: "6px 14px",
                          background: "#E6F1FB",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#185FA5",
                          textDecoration: "none",
                        }}
                      >
                        Rate doctor
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
