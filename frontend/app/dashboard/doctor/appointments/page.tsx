"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Appointment {
  id: string;
  reason: string;
  status: string;
  scheduledAt: string | null;
  patient_brief: string | null;
  notes: string | null;
  createdAt: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  hospital: { name: string } | null;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, set_appointments] = useState<Appointment[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState("ALL");
  const [selected, set_selected] = useState<Appointment | null>(null);
  const [updating, set_updating] = useState(false);

  useEffect(() => {
    const fetch_appointments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/doctor`,
          { credentials: "include" },
        );
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        set_appointments(data.data || []);
        if (data.data?.length > 0) set_selected(data.data[0]);
      } catch {
        router.push("/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_appointments();
  }, []);

  // useCallback — stable function reference
  const handle_status = useCallback(async (id: string, status: string) => {
    set_updating(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        },
      );
      set_appointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      set_selected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    } catch {
      alert("Something went wrong");
    } finally {
      set_updating(false);
    }
  }, []);

  // useMemo — only recompute when appointments or filter changes
  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? appointments
        : appointments.filter((a) => a.status === filter),
    [appointments, filter],
  );

  // useMemo — pending count
  const pending_count = useMemo(
    () => appointments.filter((a) => a.status === "PENDING").length,
    [appointments],
  );

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
    { label: "Dashboard", icon: "🏠", href: "/doctor/dashboard" },
    {
      label: "Appointments",
      icon: "📅",
      href: "/doctor/appointments",
      active: true,
    },
    { label: "Patients", icon: "👥", href: "/doctor/patients" },
    { label: "Notifications", icon: "🔔", href: "/doctor/notifications" },
    { label: "Profile", icon: "👤", href: "/doctor/profile" },
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
              {item.label === "Appointments" && pending_count > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    background: "#E24B4A",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "1px 6px",
                  }}
                >
                  {pending_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, background: "#f9fafb" }}>
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "0.5px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Appointments</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {appointments.length} total · {pending_count} pending
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            height: "calc(100vh - 65px)",
          }}
        >
          {/* List */}
          <div
            style={{
              borderRight: "0.5px solid #e5e7eb",
              overflowY: "auto",
              background: "#fff",
            }}
          >
            <div
              style={{
                padding: "10px 1rem",
                borderBottom: "0.5px solid #f3f4f6",
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {["ALL", "PENDING", "APPROVED", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => set_filter(f)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    cursor: "pointer",
                    border: "0.5px solid",
                    borderColor: filter === f ? "#1B2B6B" : "#e5e7eb",
                    background: filter === f ? "#1B2B6B" : "#fff",
                    color: filter === f ? "#fff" : "#6b7280",
                  }}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {filtered.map((apt) => (
              <div
                key={apt.id}
                onClick={() => set_selected(apt)}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "0.5px solid #f3f4f6",
                  cursor: "pointer",
                  background: selected?.id === apt.id ? "#f9fafb" : "#fff",
                  borderLeft:
                    selected?.id === apt.id
                      ? "2px solid #1B2B6B"
                      : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {apt.patient.first_name} {apt.patient.last_name}
                  </div>
                  {status_badge(apt.status)}
                </div>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  {apt.reason}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {apt.scheduledAt
                    ? new Date(apt.scheduledAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time TBD"}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div style={{ overflowY: "auto", padding: "1.5rem 2rem" }}>
              <div style={{ maxWidth: 540 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}
                    >
                      {selected.patient.first_name} {selected.patient.last_name}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Booked{" "}
                      {new Date(selected.createdAt).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </div>
                  </div>
                  {status_badge(selected.status)}
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "1.25rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        Reason
                      </div>
                      <div style={{ fontSize: 13 }}>{selected.reason}</div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        Scheduled
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {selected.scheduledAt
                          ? new Date(selected.scheduledAt).toLocaleDateString(
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
                    {selected.hospital && (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginBottom: 4,
                          }}
                        >
                          Hospital
                        </div>
                        <div style={{ fontSize: 13 }}>
                          {selected.hospital.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selected.patient_brief && (
                  <div
                    style={{
                      background: "#fff",
                      border: "0.5px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "1.25rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 8,
                      }}
                    >
                      Patient description
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: "#374151",
                      }}
                    >
                      {selected.patient_brief}
                    </div>
                  </div>
                )}

                {selected.status === "PENDING" && (
                  <div
                    style={{ display: "flex", gap: 10, marginBottom: "1rem" }}
                  >
                    <button
                      onClick={() => handle_status(selected.id, "APPROVED")}
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#E1F5EE",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#085041",
                        fontWeight: 500,
                        cursor: updating ? "not-allowed" : "pointer",
                      }}
                    >
                      {updating ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handle_status(selected.id, "REJECTED")}
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#FCEBEB",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#A32D2D",
                        fontWeight: 500,
                        cursor: updating ? "not-allowed" : "pointer",
                      }}
                    >
                      {updating ? "..." : "Reject"}
                    </button>
                  </div>
                )}

                {selected.status === "APPROVED" && (
                  <button
                    onClick={() => handle_status(selected.id, "COMPLETED")}
                    disabled={updating}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#E6F1FB",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#185FA5",
                      fontWeight: 500,
                      cursor: updating ? "not-allowed" : "pointer",
                      marginBottom: "1rem",
                    }}
                  >
                    {updating ? "..." : "Mark as completed"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              Select an appointment to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
