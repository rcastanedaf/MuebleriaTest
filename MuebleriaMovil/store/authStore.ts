import { createContext, useContext } from "react";
import type { AuthUser } from "../core/types";

interface AuthStore {
  user: AuthUser | null;
  setUser: (u: AuthUser) => void;
  clearUser: () => void;
}

export const AuthCtx = createContext<AuthStore>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
});

export const useAuth = () => useContext(AuthCtx);
