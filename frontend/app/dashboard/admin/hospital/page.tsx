"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";

interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  status: string;
  verified: boolean;
  rating: number;
  total_ratings: number;
  createdAt: string;
}

export default function AdminHospitalsPage() {
  const router = useRouter();
  const { auth_fetch } = useAuth();
  const [hospitals, set_hospitals] = useState<Hospital[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState("ALL");
  const [search, set_search] = useState("");
  const [updating, set_updating] = useState<string | null>(null);

  useEffect(() => {
    const fetch_hospitals = async () => {
      try {
        const res = await auth_fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending_hospitals`,
        );

        const data = await res.json();
        set_hospitals(data.data || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_hospitals();
  }, []);

  const handle_status = useCallback(async (id: string, status: string) => {
    set_updating(id);
    try {
      await auth_fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals/${id}/status`,
        {
          method: "PATCH",

          body: JSON.stringify({ status }),
        },
      );
      set_hospitals((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status } : h)),
      );
    } catch {
      alert("Something went wrong");
    } finally {
      set_updating(null);
    }
  }, []);

  const filtered = useMemo(() => {
    let list =
      filter === "ALL"
        ? hospitals
        : hospitals.filter((h) => h.status === filter);
    if (search) {
      list = list.filter((h) =>
        `${h.name} ${h.address} ${h.state}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    return list;
  }, [hospitals, filter, search]);

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
    { label: "Doctors", icon: "🩺", href: "/admin/doctors" },
    { label: "Hospitals", icon: "🏥", href: "/admin/hospitals", active: true },
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
            <div style={{ fontSize: 18, fontWeight: 500 }}>Hospitals</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {hospitals.length} total ·{" "}
              {hospitals.filter((h) => h.status === "PENDING").length} pending
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Search by name, address or state..."
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
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 140px",
              padding: "10px 1.25rem",
              borderBottom: "0.5px solid #f3f4f6",
              background: "#f9fafb",
            }}
          >
            {["Hospital", "Address", "State", "Status", "Actions"].map((h) => (
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
              No hospitals found
            </div>
          ) : (
            filtered.map((hosp, i) => (
              <div
                key={hosp.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 140px",
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
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {hosp.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {hosp.email}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {hosp.address}
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>
                  {hosp.state}
                </div>
                <div>{status_badge(hosp.status)}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {hosp.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handle_status(hosp.id, "APPROVED")}
                        disabled={updating === hosp.id}
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
                        onClick={() => handle_status(hosp.id, "REJECTED")}
                        disabled={updating === hosp.id}
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
                  {hosp.status === "APPROVED" && (
                    <button
                      onClick={() => handle_status(hosp.id, "SUSPENDED")}
                      disabled={updating === hosp.id}
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
                  {hosp.status === "SUSPENDED" && (
                    <button
                      onClick={() => handle_status(hosp.id, "APPROVED")}
                      disabled={updating === hosp.id}
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
