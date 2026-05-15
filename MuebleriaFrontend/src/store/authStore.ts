// store/authStore.ts
import { createContext, useContext } from "react";
import type { AuthUser } from "../core/types";

interface AuthState {
  user: AuthUser | null;
  setUser: (u: AuthUser) => void;
  clearUser: () => void;
  allowedModules: string[] | null; // null = todos los módulos (admin total)
  setAllowedModules: (m: string[] | null) => void;
}
const AuthStoreCtx = createContext<AuthState>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
  allowedModules: null,
  setAllowedModules: () => {},
});
export const useAuthStore = () => useContext(AuthStoreCtx);
export { AuthStoreCtx };
