"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, set_loading] = useState(false);
  const [done, set_done] = useState(false);
  const [show, set_show] = useState({ password: false, confirm: false });
  const [form, set_form] = useState({ password: "", confirm: "" });
  const [error, set_error] = useState("");

  const handle_submit = async () => {
    set_error("");

    if (form.password.length < 8) {
      set_error("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirm) {
      set_error("Passwords do not match");
      return;
    }

    set_loading(true);

    // get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: form.password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        set_error(data.message || "Link expired. Please request a new one.");
        return;
      }

      set_done(true);
    } catch {
      set_error("Something went wrong. Please try again.");
    } finally {
      set_loading(false);
    }
  };

  const input_style = {
    width: "100%",
    padding: "10px 44px 10px 12px",
    border: "0.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 13,
    background: "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  if (done) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#E1F5EE",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 1.25rem",
            }}
          >
            ✅
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.5rem" }}>
            Password reset
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: "0 0 1.5rem",
              lineHeight: 1.6,
            }}
          >
            Your password has been updated successfully. You can now log in with
            your new password.
          </p>
          <button
            onClick={() => router.push("/login")}
            style={{
              width: "100%",
              padding: "11px",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              background: "#1B2B6B",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 380, width: "100%" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "#1B2B6B",
            marginBottom: "2.5rem",
          }}
        >
          Kizito<span style={{ color: "#4DD9C0" }}>Health</span>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            background: "#E6F1FB",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            marginBottom: "1.25rem",
          }}
        >
          🔑
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.25rem" }}>
          Set new password
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            margin: "0 0 1.5rem",
            lineHeight: 1.6,
          }}
        >
          Must be at least 8 characters.
        </p>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              background: "#FCEBEB",
              borderRadius: 8,
              fontSize: 13,
              color: "#A32D2D",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 4,
              display: "block",
            }}
          >
            New password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={show.password ? "text" : "password"}
              value={form.password}
              onChange={(e) => set_form({ ...form, password: e.target.value })}
              style={input_style}
              placeholder="Min. 8 characters"
            />
            <button
              onClick={() => set_show({ ...show, password: !show.password })}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              {show.password ? "Hide" : "Show"}
            </button>
          </div>
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
            Confirm password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={show.confirm ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => set_form({ ...form, confirm: e.target.value })}
              style={input_style}
              placeholder="Repeat password"
            />
            <button
              onClick={() => set_show({ ...show, confirm: !show.confirm })}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              {show.confirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Password strength indicator */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background:
                    form.password.length >= i * 2
                      ? i <= 1
                        ? "#E24B4A"
                        : i <= 2
                          ? "#EF9F27"
                          : i <= 3
                            ? "#4DD9C0"
                            : "#1D9E75"
                      : "#e5e7eb",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            {form.password.length === 0
              ? ""
              : form.password.length < 4
                ? "Too weak"
                : form.password.length < 6
                  ? "Weak"
                  : form.password.length < 8
                    ? "Fair"
                    : "Strong"}
          </div>
        </div>

        <button
          onClick={handle_submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: loading ? "#6b7280" : "#1B2B6B",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "Updating password..." : "Reset password"}
        </button>

        <div style={{ textAlign: "center" }}>
          <a
            href="/login"
            style={{ fontSize: 13, color: "#1B2B6B", textDecoration: "none" }}
          >
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
