// features/auth/data/authRepository.ts
import { apiClient, tokenStorage, userStorage } from "../../../core/api/apiClient";
import { handleApiError } from "../../../core/errors/AppError";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "../../../core/types";

export const authRepository = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", payload, false);
      tokenStorage.set(res.token);
      userStorage.set(res.user);
      return res;
    } catch(e) { throw handleApiError(e); }
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/register", payload, false);
      tokenStorage.set(res.token);
      userStorage.set(res.user);
      return res;
    } catch(e) { throw handleApiError(e); }
  },
  async getProfile(): Promise<AuthUser> {
    try { return await apiClient.get<AuthUser>("/auth/profile"); }
    catch(e) { throw handleApiError(e); }
  },
  async getMisPermisos(): Promise<{ esAdmin: boolean; modulos: string[] | null }> {
    try { return await apiClient.get("/auth/mis-permisos"); }
    catch(e) { throw handleApiError(e); }
  },
  logout(): void { tokenStorage.clear(); userStorage.clear(); },
};
