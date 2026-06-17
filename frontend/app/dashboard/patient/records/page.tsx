"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HealthRecord {
  id: string;
  symptoms: string[];
  diagnosis: string;
  severity: string;
  explanation: string;
  immediateAdvice: string;
  warningSignss: string[];
  aiSource: string;
  createdAt: string;
}

export default function HealthRecordsPage() {
  const router = useRouter();
  const [records, set_records] = useState<HealthRecord[]>([]);
  const [loading, set_loading] = useState(true);
  const [selected, set_selected] = useState<HealthRecord | null>(null);

  useEffect(() => {
    const fetch_records = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/records`,
          { credentials: "include" },
        );
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        set_records(data.data || []);
        if (data.data?.length > 0) set_selected(data.data[0]);
      } catch {
        router.push("/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_records();
  }, []);

  const severity_style = (severity: string) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      LOW: { bg: "#E1F5EE", color: "#085041", border: "#0F6E56" },
      MEDIUM: { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
      HIGH: { bg: "#FCEBEB", color: "#A32D2D", border: "#E24B4A" },
      EMERGENCY: { bg: "#FDE8E8", color: "#7B1010", border: "#C00000" },
    };
    return map[severity] || map.LOW;
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/patient/dashboard" },
    { label: "Symptom check", icon: "🩺", href: "/patient/symptom-check" },
    { label: "Appointments", icon: "📅", href: "/patient/appointments" },
    {
      label: "Health records",
      icon: "📋",
      href: "/patient/records",
      active: true,
    },
    { label: "Notifications", icon: "🔔", href: "/patient/notifications" },
    { label: "Profile", icon: "👤", href: "/patient/profile" },
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
            <div style={{ fontSize: 16, fontWeight: 500 }}>Health records</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {records.length} total checks
            </div>
          </div>
          <Link
            href="/patient/symptom-check"
            style={{
              padding: "8px 16px",
              background: "#1B2B6B",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            + New check
          </Link>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              No health records yet
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Start a symptom check to see your results here
            </div>
            <Link
              href="/patient/symptom-check"
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
              Start symptom check
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              height: "calc(100vh - 65px)",
            }}
          >
            {/* Records list */}
            <div
              style={{
                borderRight: "0.5px solid #e5e7eb",
                overflowY: "auto",
                background: "#fff",
              }}
            >
              {records.map((record) => {
                const s = severity_style(record.severity);
                return (
                  <div
                    key={record.id}
                    onClick={() => set_selected(record)}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom: "0.5px solid #f3f4f6",
                      cursor: "pointer",
                      background:
                        selected?.id === record.id ? "#f9fafb" : "#fff",
                      borderLeft:
                        selected?.id === record.id
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
                        {record.diagnosis}
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 20,
                          background: s.bg,
                          color: s.color,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {record.severity.charAt(0) +
                          record.severity.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      {record.symptoms.slice(0, 3).join(", ")}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(record.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Record detail */}
            {selected && (
              <div style={{ overflowY: "auto", padding: "1.5rem 2rem" }}>
                <div style={{ maxWidth: 600 }}>
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
                        style={{
                          fontSize: 20,
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        {selected.diagnosis}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {new Date(selected.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 13,
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: severity_style(selected.severity).bg,
                        color: severity_style(selected.severity).color,
                        fontWeight: 500,
                      }}
                    >
                      {selected.severity.charAt(0) +
                        selected.severity.slice(1).toLowerCase()}
                    </span>
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
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      Symptoms detected
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {selected.symptoms.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 12,
                            padding: "4px 10px",
                            background: "#f3f4f6",
                            borderRadius: 20,
                            color: "#374151",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
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
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      Explanation
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: "#374151",
                      }}
                    >
                      {selected.explanation}
                    </div>
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
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      Immediate advice
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: "#374151",
                      }}
                    >
                      {selected.immediateAdvice}
                    </div>
                  </div>

                  {selected.warningSignss?.length > 0 && (
                    <div
                      style={{
                        background: "#FCEBEB",
                        border: "0.5px solid #E24B4A",
                        borderRadius: 12,
                        padding: "1.25rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#A32D2D",
                          marginBottom: 8,
                        }}
                      >
                        Warning signs to watch for
                      </div>
                      {selected.warningSignss.map((w) => (
                        <div
                          key={w}
                          style={{
                            display: "flex",
                            gap: 8,
                            fontSize: 13,
                            color: "#A32D2D",
                            marginBottom: 6,
                          }}
                        >
                          <span>⚠️</span>
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <Link
                      href="/patient/appointments/book"
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#1B2B6B",
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 13,
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      Book a doctor
                    </Link>
                    <Link
                      href="/patient/symptom-check"
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "0.5px solid #e5e7eb",
                        color: "#374151",
                        borderRadius: 8,
                        fontSize: 13,
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      New check
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
