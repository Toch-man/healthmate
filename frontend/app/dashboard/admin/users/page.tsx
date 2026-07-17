"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import Dialog from "@/components/dialog";

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  patient?: { first_name: string; last_name: string } | null;
  doctor?: { first_name: string; last_name: string; status: string } | null;
  hospital?: { name: string; status: string } | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { auth_fetch, logout } = useAuth();
  const [users, set_users] = useState<User[]>([]);
  const [loading, set_loading] = useState(true);
  const [role_filter, set_role_filter] = useState("ALL");
  const [search, set_search] = useState("");
  const [dialog, set_dialog] = useState<{
    open: boolean;
    type: "error" | "success" | "info";
    message: string;
    auto_close_ms?: number;
  }>({
    open: false,
    type: "error",
    message: "",
  });

  useEffect(() => {
    const fetch_users = async () => {
      try {
        const res = await auth_fetch(`/api/admin/users`);
        const data = await res.json();

        if (!res.ok) {
          set_dialog({
            open: true,
            type: "error",
            message:
              data.message || `Error ${res.status}: could not load users`,
          });
          return;
        }

        set_users(data.data || []);
      } catch (err: any) {
        set_dialog({
          open: true,
          type: "error",
          message:
            err?.message || "Network error. Please check your connection.",
        });
      } finally {
        set_loading(false);
      }
    };
    fetch_users();
  }, []);

  const handle_logout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const get_display_name = (user: User) => {
    if (user.patient)
      return `${user.patient.first_name} ${user.patient.last_name}`;
    if (user.doctor)
      return `Dr. ${user.doctor.first_name} ${user.doctor.last_name}`;
    if (user.hospital) return user.hospital.name;
    return "—";
  };

  const get_initials = (user: User) => {
    const name = get_display_name(user);
    if (name === "—") return "?";
    const parts = name.replace("Dr. ", "").split(" ");
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  };

  const role_badge = (role: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      PATIENT: { bg: "#E6F1FB", color: "#0C447C" },
      DOCTOR: { bg: "#E1F5EE", color: "#085041" },
      HOSPITAL: { bg: "#EEEDFE", color: "#534AB7" },
      ADMIN: { bg: "#1B2B6B", color: "#fff" },
    };
    const s = map[role] || map.PATIENT;
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
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
    );
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/dashboard/admin" },
    { label: "Doctors", icon: "🩺", href: "/dashboard/admin/doctor" },
    { label: "Hospitals", icon: "🏥", href: "/dashboard/admin/hospital" },
    { label: "Patients", icon: "👥", href: "/dashboard/admin/patient" },
    {
      label: "Appointments",
      icon: "📅",
      href: "/dashboard/admin/appointments",
    },
  ];

  const filters = ["ALL", "PATIENT", "DOCTOR", "HOSPITAL", "ADMIN"];

  const filtered = users.filter((u) => {
    const matches_role = role_filter === "ALL" || u.role === role_filter;
    const matches_search =
      search.trim() === "" ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      get_display_name(u).toLowerCase().includes(search.toLowerCase());
    return matches_role && matches_search;
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
                color: "#93A8D4",
                background: "transparent",
                borderLeft: "2px solid transparent",
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
              All users
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {users.length} total users
            </div>
          </div>
          <Link
            href="/dashboard/admin"
            style={{
              padding: "9px 18px",
              border: "0.5px solid #e5e7eb",
              color: "#374151",
              borderRadius: 8,
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 500,
              background: "#fff",
            }}
          >
            ← Back to overview
          </Link>
        </div>

        {/* Search + filters */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              flex: "1 1 240px",
              padding: "9px 14px",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              background: "#fff",
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => set_role_filter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: "pointer",
                  border: "0.5px solid",
                  borderColor: role_filter === f ? "#1B2B6B" : "#e5e7eb",
                  background: role_filter === f ? "#1B2B6B" : "#fff",
                  color: role_filter === f ? "#fff" : "#6b7280",
                  fontWeight: role_filter === f ? 500 : 400,
                }}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
                {f !== "ALL" && (
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>
                    ({users.filter((u) => u.role === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
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
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              No users found
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Try adjusting your search or filter
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 0.8fr 0.8fr 0.8fr",
                padding: "10px 1.25rem",
                background: "#f9fafb",
                borderBottom: "0.5px solid #e5e7eb",
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 0.3,
              }}
            >
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
            </div>

            {filtered.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.4fr 0.8fr 0.8fr 0.8fr",
                  alignItems: "center",
                  padding: "12px 1.25rem",
                  borderBottom: "0.5px solid #f3f4f6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#E6F1FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 500,
                      color: "#0C447C",
                      flexShrink: 0,
                    }}
                  >
                    {get_initials(user)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {get_display_name(user)}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: "#374151" }}>
                  {user.email}
                </span>
                <div>{role_badge(user.role)}</div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {user.doctor?.status || user.hospital?.status || "—"}
                </span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={dialog.open}
        type={dialog.type}
        message={dialog.message}
        auto_close_ms={dialog.auto_close_ms}
        on_close={() => set_dialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
}
