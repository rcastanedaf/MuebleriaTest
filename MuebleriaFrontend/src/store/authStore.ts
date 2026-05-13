// store/authStore.ts
import { createContext, useContext } from "react";
import type { AuthUser } from "../core/types";

interface AuthState {
  user: AuthUser | null;
  setUser: (u: AuthUser) => void;
  clearUser: () => void;
}
const AuthStoreCtx = createContext<AuthState>({ user: null, setUser: () => {}, clearUser: () => {} });
export const useAuthStore = () => useContext(AuthStoreCtx);
export { AuthStoreCtx };
