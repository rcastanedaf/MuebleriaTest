// features/auth/domain/authDomain.ts
import type { LoginPayload, RegisterPayload, AuthUser } from "../../../core/types";

export interface ValidationResult { valid: boolean; errors: Record<string, string>; }

export function validateLogin(p: LoginPayload): ValidationResult {
  const errors: Record<string, string> = {};
  if (!p.email || !p.email.includes("@")) errors.email = "Correo inválido";
  if (!p.password || p.password.length < 4) errors.password = "Mínimo 4 caracteres";
  return { valid: Object.keys(errors).length === 0, errors };
}
export function validateRegister(p: RegisterPayload): ValidationResult {
  const errors: Record<string, string> = {};
  if (!p.name || p.name.trim().length < 2)    errors.name = "Ingresa tu nombre completo";
  if (!p.email || !p.email.includes("@"))      errors.email = "Correo inválido";
  if (!p.password || p.password.length < 6)   errors.password = "Mínimo 6 caracteres";
  if (!p.nit || p.nit.trim().length < 4)       errors.nit = "NIT / documento inválido";
  return { valid: Object.keys(errors).length === 0, errors };
}
export const isAdmin = (u: AuthUser | null) => u?.role === "admin";
export const getUserInitials = (u: AuthUser | null) =>
  u ? u.name.split(" ").slice(0,2).map(n => n[0]?.toUpperCase() ?? "").join("") : "?";
