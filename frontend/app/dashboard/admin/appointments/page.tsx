"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface Appointment {
  id: string;
  reason: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  patient: { first_name: string; last_name: string };
  doctor: { first_name: string; last_name: string; specialization: string };
  hospital: { name: string } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, set_appointments] = useState<Appointment[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState("ALL");
  const [search, set_search] = useState("");
  const { auth_fetch } = useAuth();
  useEffect(() => {
    const fetch_appointments = async () => {
      try {
        const res = await auth_fetch(`/api/admin/appointments`, {
          credentials: "include",
        });

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

  const filtered = useMemo(() => {
    let list =
      filter === "ALL"
        ? appointments
        : appointments.filter((a) => a.status === filter);
    if (search) {
      list = list.filter((a) =>
        `${a.patient.first_name} ${a.patient.last_name} ${a.doctor.first_name} ${a.doctor.last_name} ${a.reason}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    return list;
  }, [appointments, filter, search]);

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
    { label: "Dashboard", icon: "🏠", href: "/dashboard/admin", active: true },
    { label: "Doctors", icon: "🩺", href: "/dashboard/admin/doctor" },
    { label: "Hospitals", icon: "🏥", href: "/dashboard//admin/hospital" },
    { label: "Patients", icon: "👥", href: "/dashboard//admin/patient" },
    {
      label: "Appointments",
      icon: "📅",
      href: "/dashboard/admin/appointments",
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
                color: (item as any).active ? "#fff" : "#93A8D4",
                background: (item as any).active
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                borderLeft: (item as any).active
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>
              All appointments
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {appointments.length} total
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Search by patient, doctor or reason..."
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              background: "#fff",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {["ALL", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => set_filter(f)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
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
              ),
            )}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "0.5px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr",
              padding: "10px 1.25rem",
              borderBottom: "0.5px solid #f3f4f6",
              background: "#f9fafb",
            }}
          >
            {["Patient", "Doctor", "Reason", "Scheduled", "Status"].map((h) => (
              <div
                key={h}
                style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}
              >
                {h}
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 0",
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              No appointments found
            </div>
          ) : (
            filtered.map((apt, i) => (
              <div
                key={apt.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr",
                  padding: "12px 1.25rem",
                  borderBottom:
                    i < filtered.length - 1 ? "0.5px solid #f3f4f6" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {apt.patient.first_name} {apt.patient.last_name}
                </div>
                <div>
                  <div style={{ fontSize: 13 }}>
                    Dr. {apt.doctor.first_name} {apt.doctor.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {apt.doctor.specialization}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {apt.reason}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {apt.scheduledAt
                    ? new Date(apt.scheduledAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD"}
                </div>
                <div>{status_badge(apt.status)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
