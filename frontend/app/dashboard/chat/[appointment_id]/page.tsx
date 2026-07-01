"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/app/context/auth_context";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  reason: string;
  status: string;
  patient: { first_name: string; last_name: string; user_id: string };
  doctor: {
    first_name: string;
    last_name: string;
    user_id: string;
    specialization: string;
  };
}

interface CurrentUser {
  id: string;
  role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ChatPage() {
  const { appointment_id } = useParams() as { appointment_id: string };
  const router = useRouter();
  const { auth_fetch, user } = useAuth();
  const [messages, set_messages] = useState<Message[]>([]);
  const [appointment, set_appointment] = useState<Appointment | null>(null);
  const [current_user, set_current_user] = useState<CurrentUser | null>(null);
  const [input, set_input] = useState("");
  const [loading, set_loading] = useState(true);
  const [connected, set_connected] = useState(false);
  const socket_ref = useRef<Socket | null>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        set_current_user({ id: user!.id, role: user!.role });

        const apt_res = await auth_fetch(
          `${API_URL}/api/appointments/${appointment_id}`,
        );
        const apt_data = await apt_res.json();
        set_appointment(apt_data.appointment);

        const msg_res = await auth_fetch(
          `${API_URL}/api/messages/${appointment_id}`,
        );
        const msg_data = await msg_res.json();
        set_messages(msg_data.data || []);
      } catch {
        router.push("/auth/login");
      } finally {
        set_loading(false);
      }
    };

    init();
  }, [appointment_id]);

  useEffect(() => {
    if (!current_user) return;

    const socket = io(API_URL, {
      withCredentials: true,
    });

    socket_ref.current = socket;

    socket.on("connect", () => {
      set_connected(true);
      socket.emit("join_chat", { appointment_id });
      socket.emit("mark_read", { appointment_id });
    });

    socket.on("disconnect", () => set_connected(false));

    socket.on("new_message", (message: Message) => {
      set_messages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [current_user, appointment_id]);

  const send_message = useCallback(() => {
    if (!input.trim() || !socket_ref.current) return;
    socket_ref.current.emit("send_message", {
      appointment_id,
      content: input.trim(),
    });
    set_input("");
  }, [input, appointment_id]);

  const other_user = useMemo(() => {
    if (!appointment || !current_user) return null;
    const is_patient = appointment.patient.user_id === current_user.id;
    return is_patient
      ? {
          name: `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`,
          subtitle: appointment.doctor.specialization,
        }
      : {
          name: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          subtitle: "Patient",
        };
  }, [appointment, current_user]);

  const back_href = useMemo(() => {
    if (!current_user) return "/";
    return current_user.role === "PATIENT"
      ? "/patient/appointments"
      : "/doctor/appointments";
  }, [current_user]);

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
        flexDirection: "column",
        height: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.5rem",
          background: "#fff",
          borderBottom: "0.5px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Link
          href={back_href}
          style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}
        >
          ←
        </Link>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#1B2B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 500,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {other_user?.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {other_user?.name}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {other_user?.subtitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#0F6E56" : "#9ca3af",
            }}
          />
          <span style={{ color: connected ? "#0F6E56" : "#9ca3af" }}>
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Appointment info bar */}
      {appointment && (
        <div
          style={{
            padding: "10px 1.5rem",
            background: "#E6F1FB",
            borderBottom: "0.5px solid #c7d6f7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, color: "#185FA5" }}>
            Appointment: {appointment.reason}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 20,
              background:
                appointment.status === "APPROVED" ? "#E1F5EE" : "#FAEEDA",
              color: appointment.status === "APPROVED" ? "#085041" : "#633806",
            }}
          >
            {appointment.status.charAt(0) +
              appointment.status.slice(1).toLowerCase()}
          </span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg, i) => {
              const is_mine = msg.sender_id === current_user?.id;
              const show_date =
                i === 0 ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(messages[i - 1].createdAt).toDateString();

              return (
                <div key={msg.id}>
                  {show_date && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "8px 0",
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: is_mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: is_mine
                          ? "12px 12px 2px 12px"
                          : "12px 12px 12px 2px",
                        background: is_mine ? "#1B2B6B" : "#fff",
                        color: is_mine ? "#fff" : "#111",
                        fontSize: 13,
                        lineHeight: 1.6,
                        border: is_mine ? "none" : "0.5px solid #e5e7eb",
                      }}
                    >
                      <div>{msg.content}</div>
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          color: is_mine ? "rgba(255,255,255,0.6)" : "#9ca3af",
                          textAlign: "right",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottom_ref} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderTop: "0.5px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              flex: 1,
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
              placeholder="Type a message..."
              rows={1}
              style={{
                width: "100%",
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
          </div>
          <button
            onClick={send_message}
            disabled={!input.trim() || !connected}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: !input.trim() || !connected ? "#e5e7eb" : "#1B2B6B",
              color: "#fff",
              cursor: !input.trim() || !connected ? "not-allowed" : "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
