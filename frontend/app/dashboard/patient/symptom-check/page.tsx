"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth_context";
import Dialog from "@/components/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DiagnosisResult {
  diagnosis: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  explanation: string;
  immediateAdvice: string;
  warningSignss: string[];
  symptoms: string[];
  recommended_doctors: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    location: string;
    rating: number;
    yearsExperience: number;
  }[];
  recommended_hospitals: {
    id: string;
    name: string;
    address: string;
    state: string;
    phone: string;
  }[];
}

const DEFAULT_GREETING: Message = {
  id: "1",
  role: "assistant",
  content:
    "Hello! I'm HealthMate's AI assistant. Please describe your symptoms and I'll help assess what might be going on. You can type in any language.",
  timestamp: new Date(),
};

export default function SymptomCheckPage() {
  const router = useRouter();
  const { auth_fetch } = useAuth();
  const [messages, set_messages] = useState<Message[]>([DEFAULT_GREETING]);
  const [input, set_input] = useState("");
  const [loading, set_loading] = useState(false);
  const [history_loading, set_history_loading] = useState(true);
  const [result, set_result] = useState<DiagnosisResult | null>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);
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

  // rehydrate chat history on mount so a refresh doesn't wipe the conversation
  useEffect(() => {
    const load_history = async () => {
      try {
        const res = await auth_fetch("/api/diagnosis/history");
        const data = await res.json();

        if (res.ok && data.data?.length > 0) {
          set_messages(
            data.data.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp),
            })),
          );
        }
        // if no saved history, keep the default greeting already in state
      } catch {
        // silently keep default greeting — not worth a dialog for this
      } finally {
        set_history_loading(false);
      }
    };
    load_history();
  }, []);

  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send_message = async () => {
    if (!input.trim() || loading) return;

    const user_message: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    set_messages((prev) => [...prev, user_message]);
    set_input("");
    set_loading(true);

    try {
      const res = await auth_fetch(`/api/diagnosis/chat`, {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        set_messages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "I'm having trouble analyzing your symptoms right now. Please try again.",
            timestamp: new Date(),
          },
        ]);
        set_dialog({
          open: true,
          type: "error",
          message: data.message || `Error ${res.status}: can't respond now`,
        });
        return;
      }

      if (data.type === "question") {
        set_messages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // data.type === "diagnosis"
      set_messages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.data.explanation,
          timestamp: new Date(),
        },
      ]);

      set_result(data.data);
    } catch (err: any) {
      set_messages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
      set_dialog({
        open: true,
        type: "error",
        message: err?.message || "Network error. Please check your connection.",
      });
    } finally {
      set_loading(false);
    }
  };

  const severity_color = (severity: string) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      LOW: { bg: "#E1F5EE", color: "#085041", border: "#0F6E56" },
      MEDIUM: { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
      HIGH: { bg: "#FCEBEB", color: "#A32D2D", border: "#E24B4A" },
      EMERGENCY: { bg: "#FDE8E8", color: "#7B1010", border: "#C00000" },
    };
    return map[severity] || map.LOW;
  };

  const nav_items = [
    { label: "Dashboard", icon: "🏠", href: "/dashboard/patient" },
    {
      label: "Symptom check",
      icon: "🩺",
      href: "/dashboard/patient/symptom-check",
      active: true,
    },
    {
      label: "Appointments",
      icon: "📅",
      href: "/dashboard/patient/appointment",
    },
    { label: "Health records", icon: "📋", href: "/dashboard/patient/records" },
    {
      label: "Notifications",
      icon: "🔔",
      href: "/dashboard/patient/notifications",
    },
    { label: "Profile", icon: "👤", href: "/dashboard/patient/profile" },
  ];

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
      <div
        style={{
          flex: 1,
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
            <div style={{ fontSize: 16, fontWeight: 500, color: "#111" }}>
              Symptom check
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              Describe how you're feeling and get an AI assessment
            </div>
          </div>
          <Link
            href="/dashboard/patient/records"
            style={{
              fontSize: 13,
              color: "#1B2B6B",
              textDecoration: "none",
            }}
          >
            View past checks →
          </Link>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: result ? "1fr 360px" : "1fr",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {/* Chat area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 80px)",
            }}
          >
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                {history_loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem 0",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    Loading conversation...
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: 16,
                      }}
                    >
                      {msg.role === "assistant" && (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#1B2B6B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        >
                          🩺
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "10px 14px",
                          borderRadius:
                            msg.role === "user"
                              ? "12px 12px 2px 12px"
                              : "12px 12px 12px 2px",
                          background: msg.role === "user" ? "#1B2B6B" : "#fff",
                          color: msg.role === "user" ? "#fff" : "#111",
                          fontSize: 13,
                          lineHeight: 1.6,
                          border:
                            msg.role === "assistant"
                              ? "0.5px solid #e5e7eb"
                              : "none",
                        }}
                      >
                        {msg.content}
                        <div
                          style={{
                            fontSize: 11,
                            marginTop: 4,
                            color:
                              msg.role === "user"
                                ? "rgba(255,255,255,0.6)"
                                : "#9ca3af",
                          }}
                        >
                          {msg.timestamp.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#1B2B6B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      🩺
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        background: "#fff",
                        borderRadius: "12px 12px 12px 2px",
                        border: "0.5px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#1B2B6B",
                              animation: `bounce 1s infinite ${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottom_ref} />
              </div>
            </div>

            {/* Input */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "0.5px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-end",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px 12px",
                    background: "#fff",
                  }}
                >
                  <textarea
                    value={input}
                    onChange={(e) => set_input(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send_message();
                      }
                    }}
                    placeholder="Describe your symptoms... (e.g. I have had a headache and fever for 2 days)"
                    rows={2}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      resize: "none",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.6,
                      background: "transparent",
                      color: "#111",
                    }}
                  />
                  <button
                    onClick={send_message}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: "none",
                      background:
                        !input.trim() || loading ? "#e5e7eb" : "#1B2B6B",
                      color: "#fff",
                      cursor:
                        !input.trim() || loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  This is an AI assessment tool. Always consult a qualified
                  doctor for medical advice.
                </div>
              </div>
            </div>
          </div>

          {/* Result panel */}
          {result && (
            <div
              style={{
                borderLeft: "0.5px solid #e5e7eb",
                background: "#fff",
                overflowY: "auto",
                padding: "1.5rem",
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 500, marginBottom: "1rem" }}
              >
                Assessment result
              </div>

              {/* Severity */}
              <div
                style={{
                  padding: "12px",
                  background: severity_color(result.severity).bg,
                  borderLeft: `3px solid ${severity_color(result.severity).border}`,
                  borderRadius: 8,
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: severity_color(result.severity).color,
                    marginBottom: 2,
                  }}
                >
                  Severity
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: severity_color(result.severity).color,
                  }}
                >
                  {result.severity.charAt(0) +
                    result.severity.slice(1).toLowerCase()}
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  Possible diagnosis
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {result.diagnosis}
                </div>
              </div>

              {/* Symptoms detected */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Symptoms detected
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.symptoms.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
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

              {/* Immediate advice */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  Immediate advice
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#374151",
                    background: "#f9fafb",
                    padding: "10px",
                    borderRadius: 8,
                  }}
                >
                  {result.immediateAdvice}
                </div>
              </div>

              {/* Warning signs */}
              {result.warningSignss?.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                  >
                    Warning signs
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {result.warningSignss.map((w) => (
                      <div
                        key={w}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          fontSize: 13,
                          color: "#A32D2D",
                        }}
                      >
                        <span style={{ flexShrink: 0, marginTop: 2 }}>⚠️</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended doctors */}
              {result.recommended_doctors?.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                  >
                    Recommended doctors
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {result.recommended_doctors.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/dashboard/patient/appointment/book?doctor_id=${doc.id}`}
                        style={{
                          display: "block",
                          padding: "10px",
                          border: "0.5px solid #e5e7eb",
                          borderRadius: 8,
                          textDecoration: "none",
                          color: "#111",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          Dr. {doc.first_name} {doc.last_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {doc.specialization} · {doc.location} · ⭐{" "}
                          {doc.rating.toFixed(1)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended hospitals */}
              {result.recommended_hospitals?.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                  >
                    Nearby hospitals
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {result.recommended_hospitals.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          padding: "10px",
                          border: "0.5px solid #e5e7eb",
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {h.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {h.address}, {h.state}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  set_result(null);
                  set_messages([DEFAULT_GREETING]);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#6b7280",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Start new check
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
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
