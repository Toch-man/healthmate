"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  location: string;
  rating: number;
  totalRatings: number;
  yearsExperience: number;
  status: string;
  available: boolean;
  createdAt: string;
  user: { email: string };
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [doctors, set_doctors] = useState<Doctor[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState("ALL");
  const [search, set_search] = useState("");
  const [updating, set_updating] = useState<string | null>(null);
  const { auth_fetch } = useAuth();

  useEffect(() => {
    const fetch_users = async () => {
      try {
        const res = await auth_fetch(`/api/admin/users`);

        const data = await res.json();
        set_doctors(
          data.data
            ?.filter((u: any) => u.role === "DOCTOR")
            .map((u: any) => ({
              ...u.doctor,
              user: { email: u.email },
            })) || [],
        );
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_users();
  }, []);

  const handle_status = useCallback(async (id: string, status: string) => {
    set_updating(id);
    try {
      await auth_fetch(`/api/admin/doctor_status/${id}`, {
        method: "PATCH",

        body: JSON.stringify({ status }),
      });
      set_doctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d)),
      );
    } catch {
      alert("Something went wrong");
    } finally {
      set_updating(null);
    }
  }, []);

  const filtered = useMemo(() => {
    let list =
      filter === "ALL" ? doctors : doctors.filter((d) => d.status === filter);
    if (search) {
      list = list.filter((d) =>
        `${d.first_name} ${d.last_name} ${d.specialization} ${d.location}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    return list;
  }, [doctors, filter, search]);

  const status_badge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      APPROVED: { bg: "#E1F5EE", color: "#085041" },
      PENDING: { bg: "#FAEEDA", color: "#633806" },
      REJECTED: { bg: "#FCEBEB", color: "#A32D2D" },
      SUSPENDED: { bg: "#F3F4F6", color: "#6b7280" },
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
    { label: "Dashboard", icon: "🏠", href: "/admin/dashboard" },
    { label: "Doctors", icon: "🩺", href: "/admin/doctors", active: true },
    { label: "Hospitals", icon: "🏥", href: "/admin/hospitals" },
    { label: "Patients", icon: "👥", href: "/admin/patients" },
    { label: "Appointments", icon: "📅", href: "/admin/appointments" },
    { label: "Settings", icon: "⚙️", href: "/admin/settings" },
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Doctors</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {doctors.length} total ·{" "}
              {doctors.filter((d) => d.status === "PENDING").length} pending
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Search by name, specialization or location..."
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
            {["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => set_filter(f)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 12,
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
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 140px",
              padding: "10px 1.25rem",
              borderBottom: "0.5px solid #f3f4f6",
              background: "#f9fafb",
            }}
          >
            {[
              "Doctor",
              "Specialization",
              "Location",
              "Rating",
              "Status",
              "Actions",
            ].map((h) => (
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
              No doctors found
            </div>
          ) : (
            filtered.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 140px",
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
                    {doc.first_name?.[0]}
                    {doc.last_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      Dr. {doc.first_name} {doc.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {doc.user?.email}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {doc.specialization}
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {doc.location}
                </div>
                <div style={{ fontSize: 13 }}>
                  ⭐ {doc.rating?.toFixed(1) || "0.0"}
                </div>
                <div>{status_badge(doc.status)}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {doc.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handle_status(doc.id, "APPROVED")}
                        disabled={updating === doc.id}
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
                        onClick={() => handle_status(doc.id, "REJECTED")}
                        disabled={updating === doc.id}
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
                    </>
                  )}
                  {doc.status === "APPROVED" && (
                    <button
                      onClick={() => handle_status(doc.id, "SUSPENDED")}
                      disabled={updating === doc.id}
                      style={{
                        padding: "5px 10px",
                        background: "#F3F4F6",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                    >
                      Suspend
                    </button>
                  )}
                  {doc.status === "SUSPENDED" && (
                    <button
                      onClick={() => handle_status(doc.id, "APPROVED")}
                      disabled={updating === doc.id}
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
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
