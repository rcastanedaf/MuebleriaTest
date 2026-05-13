// features/auth/hooks/useAuth.ts
import { useState, useCallback } from "react";
import { authRepository } from "../data/authRepository";
import { validateLogin, validateRegister } from "../domain/authDomain";
import { useAuthStore } from "../../../store/authStore";
import type { LoginPayload, RegisterPayload } from "../../../core/types";

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const login = useCallback(async (p: LoginPayload) => {
    const v = validateLogin(p);
    if (!v.valid) { setErrors(v.errors); return false; }
    setLoading(true); setErrors({});
    try { const res = await authRepository.login(p); setUser(res.user); return true; }
    catch(e: any) { setErrors({ general: e.message ?? "Credenciales inválidas" }); return false; }
    finally { setLoading(false); }
  }, [setUser]);

  const register = useCallback(async (p: RegisterPayload) => {
    const v = validateRegister(p);
    if (!v.valid) { setErrors(v.errors); return false; }
    setLoading(true); setErrors({});
    try { const res = await authRepository.register(p); setUser(res.user); return true; }
    catch(e: any) { setErrors({ general: e.message ?? "Error al registrar" }); return false; }
    finally { setLoading(false); }
  }, [setUser]);

  const logout = useCallback(() => { authRepository.logout(); clearUser(); }, [clearUser]);

  return { user, loading, errors, login, register, logout };
}
