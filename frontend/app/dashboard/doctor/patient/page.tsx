"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  appointment_id: string;
  reason: string;
  scheduledAt: string | null;
  status: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, set_patients] = useState<Patient[]>([]);
  const [loading, set_loading] = useState(true);
  const [search, set_search] = useState("");

  useEffect(() => {
    const fetch_patients = async () => {
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

        const seen = new Set();
        const patient_list: Patient[] = [];
        for (const apt of data.data || []) {
          if (!seen.has(apt.patient_id)) {
            seen.add(apt.patient_id);
            patient_list.push({
              id: apt.patient_id,
              first_name: apt.patient.first_name,
              last_name: apt.patient.last_name,
              appointment_id: apt.id,
              reason: apt.reason,
              scheduledAt: apt.scheduledAt,
              status: apt.status,
            });
          }
        }
        set_patients(patient_list);
      } catch {
        router.push("/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_patients();
  }, []);

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        `${p.first_name} ${p.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [patients, search],
  );

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/doctor/dashboard" },
    { label: "Appointments", icon: "📅", href: "/doctor/appointments" },
    { label: "Patients", icon: "👥", href: "/doctor/patients", active: true },
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
            <div style={{ fontSize: 18, fontWeight: 500 }}>Patients</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {patients.length} total
            </div>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => set_search(e.target.value)}
          placeholder="Search patients..."
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "0.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
            background: "#fff",
            marginBottom: "1.25rem",
            boxSizing: "border-box",
          }}
        />

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
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              No patients yet
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((patient) => (
              <div
                key={patient.id}
                style={{
                  background: "#fff",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
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
                  {patient.first_name[0]}
                  {patient.last_name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {patient.first_name} {patient.last_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {patient.reason} ·{" "}
                    {patient.scheduledAt
                      ? new Date(patient.scheduledAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )
                      : "TBD"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {patient.status === "APPROVED" && (
                    <Link
                      href={`/chat/${patient.appointment_id}`}
                      style={{
                        padding: "7px 14px",
                        background: "#1B2B6B",
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 12,
                        textDecoration: "none",
                      }}
                    >
                      Open chat
                    </Link>
                  )}
                  <Link
                    href="/doctor/appointments"
                    style={{
                      padding: "7px 14px",
                      border: "0.5px solid #e5e7eb",
                      color: "#374151",
                      borderRadius: 8,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    View appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
