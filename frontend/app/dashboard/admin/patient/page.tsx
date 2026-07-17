"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface Patient {
  id: string;
  email: string;
  createdAt: string;
  patient: {
    first_name: string;
    last_name: string;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPatientsPage() {
  const router = useRouter();
  const { auth_fetch } = useAuth();
  const [patients, set_patients] = useState<Patient[]>([]);
  const [loading, set_loading] = useState(true);
  const [search, set_search] = useState("");

  useEffect(() => {
    const fetch_patients = async () => {
      try {
        const res = await auth_fetch(`/api/admin/users`);
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        set_patients(data.data?.filter((u: any) => u.role === "PATIENT") || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_patients();
  }, []);

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        `${p.patient?.first_name || ""} ${p.patient?.last_name || ""} ${p.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [patients, search],
  );

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
            <div style={{ fontSize: 18, fontWeight: 500 }}>Patients</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {patients.length} total
            </div>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => set_search(e.target.value)}
          placeholder="Search by name or email..."
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
              gridTemplateColumns: "2fr 2fr 1fr",
              padding: "10px 1.25rem",
              borderBottom: "0.5px solid #f3f4f6",
              background: "#f9fafb",
            }}
          >
            {["Patient", "Email", "Joined"].map((h) => (
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
              No patients found
            </div>
          ) : (
            filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr",
                  padding: "12px 1.25rem",
                  borderBottom:
                    i < filtered.length - 1 ? "0.5px solid #f3f4f6" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
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
                    {p.patient?.first_name?.[0]}
                    {p.patient?.last_name?.[0]}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {p.patient?.first_name || "—"} {p.patient?.last_name || ""}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{p.email}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {new Date(p.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
