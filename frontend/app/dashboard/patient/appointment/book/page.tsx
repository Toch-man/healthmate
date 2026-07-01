"use client";

import { useEffect, useState } from "react";
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
  bio: string | null;
  hospital: { name: string; address: string } | null;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { auth_fetch } = useAuth();
  const [doctors, set_doctors] = useState<Doctor[]>([]);
  const [loading, set_loading] = useState(true);
  const [booking, set_booking] = useState(false);
  const [selected_doctor, set_selected_doctor] = useState<Doctor | null>(null);
  const [search, set_search] = useState("");
  const [specialization_filter, set_specialization_filter] = useState("");
  const [form, set_form] = useState({
    reason: "",
    patient_brief: "",
    time: "",
  });

  useEffect(() => {
    const fetch_doctors = async () => {
      try {
        const params = new URLSearchParams();
        if (specialization_filter)
          params.set("specialization", specialization_filter);

        const res = await auth_fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/doctors?$/d{params}`
          { credentials: "include" ,
        );
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        set_doctors(data.data || []);
      } catch {
        router.push("/login");
      } finally {
        set_loading(false);
      }
    };
    fetch_doctors();
  }, [specialization_filter]);

  const handle_book = async () => {
    if (!selected_doctor || !form.reason) {
      alert("Please select a doctor and provide a reason");
      return;
    }
    set_booking(true);
    try {
      const res = await auth_fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${selected_doctor.id}/book`,
        {
          method: "POST",
         
          
          body: JSON.stringify(form,
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      router.push("/patient/appointments");
    } catch {
      alert("Something went wrong");
    } finally {
      set_booking(false);
    }
  };

  const filtered_doctors = doctors.filter((d) =>
    `${d.first_name} ${d.last_name} ${d.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  const input_style = {
    width: "100%",
    padding: "10px 12px",
    border: "0.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 13,
    background: "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
    outline: "none",
  };

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
          {[
            { label: "Dashboard", icon: "🏠", href: "/patient/dashboard" },
            {
              label: "Symptom check",
              icon: "🩺",
              href: "/patient/symptom-check",
            },
            {
              label: "Appointments",
              icon: "📅",
              href: "/patient/appointments",
              active: true,
            },
            { label: "Health records", icon: "📋", href: "/patient/records" },
            {
              label: "Notifications",
              icon: "🔔",
              href: "/patient/notifications",
            },
            { label: "Profile", icon: "👤", href: "/patient/profile" },
          ].map((item: any) => (
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
      <div style={{ flex: 1, background: "#f9fafb" }}>
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "0.5px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href="/patient/appointments"
            style={{
              fontSize: 13,
              color: "#6b7280",
              textDecoration: "none",
            }}
          >
            ← Back
          </Link>
          <div style={{ width: "0.5px", height: 16, background: "#e5e7eb" }} />
          <div style={{ fontSize: 16, fontWeight: 500 }}>Book appointment</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 0,
            height: "calc(100vh - 65px)",
          }}
        >
          {/* Doctor list */}
          <div style={{ padding: "1.5rem", overflowY: "auto" }}>
            {/* Search + filter */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
              <input
                value={search}
                onChange={(e) => set_search(e.target.value)}
                placeholder="Search doctors by name or specialization..."
                style={{ ...input_style, flex: 1 }}
              />
              <select
                value={specialization_filter}
                onChange={(e) => set_specialization_filter(e.target.value)}
                style={{ ...input_style, width: 180 }}
              >
                <option value="">All specializations</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Loading doctors...
                </div>
              </div>
            ) : filtered_doctors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🩺</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  No doctors found
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filtered_doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => set_selected_doctor(doc)}
                    style={{
                      border:
                        selected_doctor?.id === doc.id
                          ? "1.5px solid #1B2B6B"
                          : "0.5px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "1rem",
                      cursor: "pointer",
                      background:
                        selected_doctor?.id === doc.id ? "#f0f4ff" : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
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
                        {doc.first_name[0]}
                        {doc.last_name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                              Dr. {doc.first_name} {doc.last_name}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#6b7280",
                                marginTop: 2,
                              }}
                            >
                              {doc.specialization} · {doc.yearsExperience} yrs
                              exp
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span style={{ fontSize: 12 }}>⭐</span>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {doc.rating.toFixed(1)}
                            </span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              ({doc.totalRatings})
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 6,
                          }}
                        >
                          📍 {doc.location}
                          {doc.hospital && ` · ${doc.hospital.name}`}
                        </div>
                        {doc.bio && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            {doc.bio.length > 100
                              ? doc.bio.slice(0, 100) + "..."
                              : doc.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking form */}
          <div
            style={{
              borderLeft: "0.5px solid #e5e7eb",
              background: "#fff",
              padding: "1.5rem",
              overflowY: "auto",
            }}
          >
            <div
              style={{ fontSize: 14, fontWeight: 500, marginBottom: "1.25rem" }}
            >
              Appointment details
            </div>

            {!selected_doctor ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👈</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Select a doctor from the list to continue
                </div>
              </div>
            ) : (
              <>
                {/* Selected doctor */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px",
                    background: "#f0f4ff",
                    borderRadius: 8,
                    marginBottom: "1.25rem",
                    border: "0.5px solid #1B2B6B",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#E6F1FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#0C447C",
                    }}
                  >
                    {selected_doctor.first_name[0]}
                    {selected_doctor.last_name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      Dr. {selected_doctor.first_name}{" "}
                      {selected_doctor.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {selected_doctor.specialization}
                    </div>
                  </div>
                  <button
                    onClick={() => set_selected_doctor(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 16,
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Reason for visit *
                  </label>
                  <input
                    value={form.reason}
                    onChange={(e) =>
                      set_form({ ...form, reason: e.target.value })
                    }
                    placeholder="e.g. Chest pain, follow-up, general checkup"
                    style={input_style}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Preferred date & time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.time}
                    onChange={(e) =>
                      set_form({ ...form, time: e.target.value })
                    }
                    style={input_style}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Brief description (optional)
                  </label>
                  <textarea
                    value={form.patient_brief}
                    onChange={(e) =>
                      set_form({ ...form, patient_brief: e.target.value })
                    }
                    placeholder="Describe your symptoms or what you'd like to discuss..."
                    rows={4}
                    style={{
                      ...input_style,
                      resize: "none",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <button
                  onClick={handle_book}
                  disabled={booking || !form.reason}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: booking || !form.reason ? "#9ca3af" : "#1B2B6B",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: booking || !form.reason ? "not-allowed" : "pointer",
                  }}
                >
                  {booking ? "Booking..." : "Confirm booking"}
                </button>

                <p
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  The doctor will confirm or suggest a different time
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
