"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          borderBottom: "0.5px solid #e5e7eb",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 500, color: "#1B2B6B" }}>
          Kizito<span style={{ color: "#4DD9C0" }}>Health</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/auth/login"
            style={{
              padding: "8px 18px",
              border: "0.5px solid #1B2B6B",
              borderRadius: 8,
              fontSize: 13,
              color: "#1B2B6B",
              background: "transparent",
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
          <Link
            href="/auth/sign_up"
            style={{
              padding: "8px 18px",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              color: "#fff",
              background: "#1B2B6B",
              textDecoration: "none",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          padding: "5rem 2rem 3rem",
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#E1F5EE",
            color: "#0F6E56",
            fontSize: 11,
            padding: "4px 12px",
            borderRadius: 20,
            marginBottom: "1rem",
          }}
        >
          AI-powered health assessment
        </div>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 500,
            lineHeight: 1.25,
            margin: "0 0 1rem",
            color: "#111",
          }}
        >
          Understand your symptoms.
          <br />
          <span style={{ color: "#1B2B6B" }}>Get the right care.</span>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.7,
            margin: "0 0 2rem",
            maxWidth: 480,
            marginInline: "auto",
          }}
        >
          KizitoHealth combines AI diagnosis with real doctor connections — so
          you always know what to do next when it matters most.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/signup"
            style={{
              padding: "12px 28px",
              borderRadius: 8,
              fontSize: 14,
              color: "#fff",
              background: "#1B2B6B",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Start for free
          </Link>
          <a
            href="#how-it-works"
            style={{
              padding: "12px 28px",
              borderRadius: 8,
              fontSize: 14,
              color: "#1B2B6B",
              border: "0.5px solid #1B2B6B",
              textDecoration: "none",
            }}
          >
            Learn how it works
          </a>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          padding: "0 2rem 4rem",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        {[
          { value: "98%", label: "Symptom accuracy" },
          { value: "2min", label: "Average assessment" },
          { value: "500+", label: "Verified doctors" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              textAlign: "center",
              padding: "1.25rem",
              background: "#f9fafb",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 500, color: "#1B2B6B" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div
        id="how-it-works"
        style={{ padding: "3rem 2rem", background: "#f9fafb" }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: "0.5rem",
            }}
          >
            How it works
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 0.5rem" }}>
            Three steps to better health
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 2rem" }}>
            No waiting rooms. No guesswork. Just clear answers.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              {
                icon: "💬",
                color: "#E1F5EE",
                title: "Describe symptoms",
                desc: "Tell our AI what you're feeling in your own words",
              },
              {
                icon: "🧠",
                color: "#E6F1FB",
                title: "Get AI diagnosis",
                desc: "Our model analyses and gives you a clear assessment",
              },
              {
                icon: "🩺",
                color: "#EEEDFE",
                title: "Book a doctor",
                desc: "Connect with a verified specialist when you need one",
              },
            ].map((step) => (
              <div
                key={step.title}
                style={{
                  background: "#fff",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: step.color,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {step.title}
                </div>
                <div
                  style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For who */}
      <div style={{ padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: "0.5rem",
            }}
          >
            Built for everyone
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 0.5rem" }}>
            One platform, every role
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 2rem" }}>
            Whether you're a patient, doctor, or hospital — KizitoHealth works
            for you.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              {
                icon: "👤",
                border: "#1B2B6B",
                title: "Patients",
                desc: "Assess symptoms, book appointments and manage your health history",
              },
              {
                icon: "🩺",
                border: "#4DD9C0",
                title: "Doctors",
                desc: "Manage your appointments, ratings and patient records in one place",
              },
              {
                icon: "🏥",
                border: "#534AB7",
                title: "Hospitals",
                desc: "Onboard your doctors, track appointments and manage your profile",
              },
            ].map((role) => (
              <div
                key={role.title}
                style={{
                  background: "#fff",
                  border: "0.5px solid #e5e7eb",
                  borderTop: `2px solid ${role.border}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>{role.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {role.title}
                </div>
                <div
                  style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}
                >
                  {role.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          padding: "4rem 2rem",
          background: "#1B2B6B",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#fff",
            margin: "0 0 0.5rem",
          }}
        >
          Ready to take control of your health?
        </h2>
        <p style={{ fontSize: 14, color: "#93A8D4", margin: "0 0 1.5rem" }}>
          Join thousands already using KizitoHealth
        </p>
        <Link
          href="/auth/signup"
          style={{
            display: "inline-block",
            background: "#4DD9C0",
            color: "#0F6E56",
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Create free account
        </Link>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderTop: "0.5px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 500, color: "#1B2B6B" }}>
          Kizito<span style={{ color: "#4DD9C0" }}>Health</span>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          © 2026 KizitoHealth. All rights reserved.
        </div>
      </div>
    </div>
  );
}
