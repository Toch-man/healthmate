"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DoctorNotificationsPage() {
  const router = useRouter();
  const [notifications, set_notifications] = useState<Notification[]>([]);
  const [loading, set_loading] = useState(true);
  const [filter, set_filter] = useState<"ALL" | "UNREAD">("ALL");

  useEffect(() => {
    const fetch_notifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patients/notifications`, {
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        set_notifications(data.data || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_notifications();
  }, []);

  const mark_read = useCallback(async (id: string) => {
    set_notifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await fetch(`${API_URL}/api/patients/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
  }, []);

  const mark_all_read = useCallback(async () => {
    set_notifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch(`${API_URL}/api/patients/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    });
  }, []);

  const filtered = useMemo(
    () =>
      filter === "UNREAD"
        ? notifications.filter((n) => !n.read)
        : notifications,
    [notifications, filter],
  );

  const unread_count = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/doctor/dashboard" },
    { label: "Appointments", icon: "📅", href: "/doctor/appointments" },
    { label: "Patients", icon: "👥", href: "/doctor/patients" },
    {
      label: "Notifications",
      icon: "🔔",
      href: "/doctor/notifications",
      active: true,
    },
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
                position: "relative",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.label === "Notifications" && unread_count > 0 && (
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
                  {unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, background: "#f9fafb", padding: "1.75rem" }}>
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>Notifications</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {unread_count} unread
              </div>
            </div>
            {unread_count > 0 && (
              <button
                onClick={mark_all_read}
                style={{
                  fontSize: 13,
                  color: "#1B2B6B",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
            {(["ALL", "UNREAD"] as const).map((f) => (
              <button
                key={f}
                onClick={() => set_filter(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
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
            ))}
          </div>

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
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                {filter === "UNREAD"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && mark_read(n.id)}
                  style={{
                    background: n.read ? "#fff" : "#f0f4ff",
                    border: `0.5px solid ${n.read ? "#e5e7eb" : "#c7d6f7"}`,
                    borderRadius: 12,
                    padding: "1rem 1.25rem",
                    cursor: n.read ? "default" : "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: n.read ? "#f3f4f6" : "#E6F1FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    🔔
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: n.read ? 400 : 500,
                          color: "#111",
                          marginBottom: 4,
                        }}
                      >
                        {n.title}
                      </div>
                      {!n.read && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#1B2B6B",
                            flexShrink: 0,
                            marginLeft: 8,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        lineHeight: 1.5,
                        marginBottom: 6,
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(n.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
