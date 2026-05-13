// features/catalog/data/catalogRepository.ts
import { apiClient } from "../../../core/api/apiClient";
import { handleApiError } from "../../../core/errors/AppError";
import type { Articulo } from "../../../core/types";

export const catalogRepository = {
  async getAll(params?: { tipo?: string; search?: string }): Promise<Articulo[]> {
    try {
      const r = await apiClient.get<{ data: Articulo[] }>("/articulos", params as any);
      return r.data ?? [];
    } catch(e) { throw handleApiError(e); }
  },
  async getById(id: number): Promise<Articulo> {
    try { return await apiClient.get<Articulo>(`/articulos/${id}`); }
    catch(e) { throw handleApiError(e); }
  },
};
