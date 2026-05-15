// src/pages/admin/AdminLoginPage.tsx
import React, { useState } from "react";
import { authRepository } from "../../features/auth/data/authRepository";
import { useAuthStore } from "../../store/authStore";

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function AdminLoginPage({ showToast }: Props) {
  const { setUser, setAllowedModules } = useAuthStore();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email y contraseña son requeridos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authRepository.login({ email, password });
      if (res.user.role === "cliente") {
        authRepository.logout();
        setError("Acceso denegado. Este panel es exclusivo para administradores.");
        return;
      }
      const perms = await authRepository.getMisPermisos();
      setAllowedModules(perms.esAdmin ? null : perms.modulos);
      setUser(res.user);
      showToast(`Bienvenido, ${res.user.name}`, "success");
    } catch (err: any) {
      setError(err?.message ?? "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--dark)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--bg3)", borderRadius: "var(--radiusLg)",
        padding: "40px 36px", boxShadow: "var(--shadowMd)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26, fontWeight: 600, color: "var(--dark)",
          }}>
            Muebles Los Alpes
          </p>
          <p style={{ fontSize: 13, color: "var(--txtMuted)", marginTop: 4 }}>
            Panel Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--txtMid)", marginBottom: 6, letterSpacing: "0.04em" }}>
              Correo electrónico
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@empresa.com" autoComplete="email"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid var(--sand)", borderRadius: "var(--radius)",
                background: "var(--bg)", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--txtMid)", marginBottom: 6, letterSpacing: "0.04em" }}>
              Contraseña
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid var(--sand)", borderRadius: "var(--radius)",
                background: "var(--bg)", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {error && (
            <p style={{
              fontSize: 13, color: "var(--danger)",
              background: "rgba(184,50,50,0.06)",
              border: "1px solid rgba(184,50,50,0.2)",
              borderRadius: "var(--radius)", padding: "8px 12px",
            }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, padding: "12px 0",
            background: loading ? "var(--sand)" : "var(--dark)",
            color: "#fff", border: "none", borderRadius: "var(--radius)",
            fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s", letterSpacing: "0.04em",
          }}>
            {loading ? "Iniciando sesión…" : "Ingresar"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--txtMuted)" }}>
          ¿Eres cliente?{" "}
          <a href="/" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
            Ir al portal de ventas
          </a>
        </p>
      </div>
    </div>
  );
}
