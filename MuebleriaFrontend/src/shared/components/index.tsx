// shared/components/index.tsx
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import type { BadgeVariant } from "../utils";

// ── Button ────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
const BV: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: "var(--olive)",  color: "#fff", border: "none" },
  secondary: { background: "transparent",  color: "var(--olive)", border: "1px solid var(--olive)" },
  ghost:     { background: "transparent",  color: "var(--txtMuted)", border: "1px solid var(--sand)" },
  danger:    { background: "transparent",  color: "var(--danger)", border: "1px solid var(--danger)" },
  gold:      { background: "var(--gold)",  color: "#fff", border: "none" },
};
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; loading?: boolean; fullWidth?: boolean; size?: "sm" | "md" | "lg";
}> = ({ variant = "primary", loading, fullWidth, size = "md", children, disabled, style, ...rest }) => (
  <button
    disabled={disabled || loading}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: size === "sm" ? "5px 12px" : size === "lg" ? "12px 28px" : "9px 20px",
      fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
      fontWeight: 500, borderRadius: "var(--radius)", cursor: (disabled || loading) ? "not-allowed" : "pointer",
      opacity: (disabled || loading) ? 0.55 : 1, width: fullWidth ? "100%" : "auto",
      transition: "all 0.15s", fontFamily: "inherit", ...BV[variant], ...style,
    }}
    {...rest}
  >
    {loading ? <Spin size={14} /> : children}
  </button>
);

// ── Input ─────────────────────────────────────────────────────
export const Input: React.FC<{
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
  error?: string; hint?: string; readOnly?: boolean;
}> = ({ label, value, onChange, type = "text", placeholder, required, error, hint, readOnly }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--txtMuted)" }}>
          {label}{required && <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        type={type} value={value} readOnly={readOnly}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "9px 12px",
          background: readOnly ? "var(--bg2)" : "var(--bg3)",
          border: `1px solid ${error ? "var(--danger)" : focused ? "var(--olive)" : "var(--sand)"}`,
          borderRadius: "var(--radius)", color: "var(--txt)",
          fontSize: 13, outline: "none", transition: "border-color 0.15s", fontFamily: "inherit",
        }}
      />
      {error && <p style={{ fontSize: 11, color: "var(--danger)", margin: 0 }}>{error}</p>}
      {hint  && <p style={{ fontSize: 11, color: "var(--txtMuted)", margin: 0 }}>{hint}</p>}
    </div>
  );
};

// ── Select ────────────────────────────────────────────────────
export const Select: React.FC<{
  label?: string; value: string | number; onChange: (v: string) => void;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean; error?: string; placeholder?: string;
}> = ({ label, value, onChange, options, required, error, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--txtMuted)" }}>
          {label}{required && <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "9px 12px", background: "var(--bg3)",
          border: `1px solid ${error ? "var(--danger)" : focused ? "var(--olive)" : "var(--sand)"}`,
          borderRadius: "var(--radius)", color: "var(--txt)",
          fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ fontSize: 11, color: "var(--danger)", margin: 0 }}>{error}</p>}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────
export const Modal: React.FC<{
  isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; width?: number;
}> = ({ isOpen, onClose, title, children, width = 540 }) => {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,23,20,0.55)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
    >
      <div style={{
        background: "var(--bg3)", border: "1px solid var(--sand)", borderRadius: "var(--radiusLg)",
        width: "100%", maxWidth: width, maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 8px 40px rgba(26,23,20,0.22)",
      }}>
        {title && (
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--sand)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, fontFamily: "Cormorant Garamond, serif" }}>{title}</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--txtMuted)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
        )}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ── Badge / StatusBadge ───────────────────────────────────────
const BADGE_COLORS: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: "rgba(74,82,64,0.1)",   color: "var(--olive)",   border: "rgba(74,82,64,0.25)" },
  success: { bg: "rgba(46,107,79,0.1)",  color: "var(--success)", border: "rgba(46,107,79,0.25)" },
  danger:  { bg: "rgba(184,50,50,0.1)",  color: "var(--danger)",  border: "rgba(184,50,50,0.25)" },
  warning: { bg: "rgba(180,120,0,0.1)",  color: "#8c6200",        border: "rgba(180,120,0,0.25)" },
  info:    { bg: "rgba(30,100,180,0.1)", color: "#1e4fa0",        border: "rgba(30,100,180,0.25)" },
  muted:   { bg: "rgba(0,0,0,0.05)",     color: "var(--txtMuted)", border: "rgba(0,0,0,0.1)" },
};
export const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant }> = ({ children, variant = "default" }) => {
  const c = BADGE_COLORS[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{children}</span>
  );
};

import { estadoLabel, estadoBadge } from "../utils";
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge variant={estadoBadge(status)}>{estadoLabel(status)}</Badge>
);

// ── Spinner ───────────────────────────────────────────────────
export const Spin: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <span style={{
    display: "inline-block", width: size, height: size, borderRadius: "50%",
    border: "2px solid var(--sand)", borderTopColor: "var(--olive)",
    animation: "spin 0.7s linear infinite", flexShrink: 0,
  }} />
);
export const Spinner: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spin size={32} /></div>
);

// ── Toast ─────────────────────────────────────────────────────
import type { ToastItem } from "../hooks";
export const Toast: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => (
  <div style={{
    position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)",
    zIndex: 9000, display: "flex", flexDirection: "column", gap: 8,
    width: "88%", maxWidth: 360, pointerEvents: "none",
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "error" ? "#fff0f0" : "#f0f4ee",
        border: `1px solid ${t.type === "error" ? "#e8b4b4" : "#b4c4b0"}`,
        color: t.type === "error" ? "var(--danger)" : "var(--olive)",
        padding: "10px 16px", borderRadius: "var(--radius)",
        fontSize: 13, fontWeight: 500, textAlign: "center",
        boxShadow: "0 2px 16px rgba(26,23,20,0.1)",
      }}>{t.msg}</div>
    ))}
  </div>
);

// ── ConfirmDialog ─────────────────────────────────────────────
export const ConfirmDialog: React.FC<{
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title?: string; message?: string;
}> = ({ isOpen, onClose, onConfirm, title = "Confirmar", message = "¿Está seguro de esta acción?" }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} width={360}>
    <p style={{ color: "var(--txtMid)", lineHeight: 1.7, marginBottom: 20 }}>{message}</p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
    </div>
  </Modal>
);
