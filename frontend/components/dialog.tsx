"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type DialogType = "error" | "success" | "info" | "warning";

interface DialogProps {
  open: boolean;
  type?: DialogType;
  title?: string;
  message: string;
  on_close: () => void;
  on_confirm?: () => void;
  confirm_label?: string;
  cancel_label?: string;
  /** If set, dialog auto-closes after this many ms (e.g. 1500). Leave unset for manual dismiss only — recommended for errors. */
  auto_close_ms?: number;
}

const TYPE_STYLES: Record<
  DialogType,
  { bg: string; color: string; icon: string; border: string }
> = {
  error: { bg: "#FCEBEB", color: "#A32D2D", icon: "⚠️", border: "#F5C6C6" },
  success: { bg: "#E1F5EE", color: "#085041", icon: "✅", border: "#B9E6D5" },
  info: { bg: "#E6F1FB", color: "#185FA5", icon: "ℹ️", border: "#BFDCF5" },
  warning: { bg: "#FAEEDA", color: "#633806", icon: "❗", border: "#F0DBA8" },
};

export default function Dialog({
  open,
  type = "info",
  title,
  message,
  on_close,
  on_confirm,
  confirm_label = "OK",
  cancel_label = "Cancel",
  auto_close_ms,
}: DialogProps) {
  // close on ESC key
  useEffect(() => {
    if (!open) return;
    const handle_key = (e: KeyboardEvent) => {
      if (e.key === "Escape") on_close();
    };
    window.addEventListener("keydown", handle_key);
    return () => window.removeEventListener("keydown", handle_key);
  }, [open, on_close]);

  // auto-close timer
  useEffect(() => {
    if (!open || !auto_close_ms) return;
    const timer = setTimeout(() => {
      on_close();
    }, auto_close_ms);
    return () => clearTimeout(timer);
  }, [open, auto_close_ms, on_close]);

  const style = TYPE_STYLES[type];
  const default_title =
    title ||
    {
      error: "Something went wrong",
      success: "Success",
      info: "Notice",
      warning: "Warning",
    }[type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={on_close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 17, 17, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              background: "#fff",
              borderRadius: 14,
              width: 380,
              maxWidth: "90vw",
              padding: "1.5rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* auto-close progress bar */}
            {auto_close_ms && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: auto_close_ms / 1000, ease: "linear" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 3,
                  width: "100%",
                  background: style.color,
                  transformOrigin: "left",
                  opacity: 0.5,
                }}
              />
            )}

            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 300 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {style.icon}
              </motion.div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                {default_title}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              style={{
                fontSize: 13,
                color: "#4b5563",
                lineHeight: 1.5,
                marginBottom: 20,
              }}
            >
              {message}
            </motion.div>

            {/* Hide action buttons entirely when auto-closing with no confirm action */}
            {!(auto_close_ms && !on_confirm) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.14, duration: 0.2 }}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                {on_confirm && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={on_close}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {cancel_label}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (on_confirm) on_confirm();
                    on_close();
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    border: "none",
                    background: style.color,
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {confirm_label}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
