// features/admin/hooks/useCrud.ts
import { useState, useEffect, useCallback } from "react";
import type { AdminRepo } from "../data/adminRepository";

export function useCrud<T extends Record<string,any>>(repo: AdminRepo<T>, pkField: string) {
  const [rows,    setRows]    = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(0);
  const PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await repo.getAll()); }
    catch(e: any) { setError(e.message ?? "Error al cargar"); }
    finally { setLoading(false); }
  }, [repo]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    setSaving(true); setError(null);
    try {
      const created = await repo.create(data);
      await load();
      return created;
    }
    catch(e: any) { setError(e.message ?? "Error al crear"); return null; }
    finally { setSaving(false); }
  }, [repo, load]);

  const update = useCallback(async (id: number, data: Partial<T>): Promise<boolean> => {
    setSaving(true); setError(null);
    try {
      await repo.update(id, data);
      await load();
      return true;
    }
    catch(e: any) { setError(e.message ?? "Error al actualizar"); return false; }
    finally { setSaving(false); }
  }, [repo, pkField, load]);

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    try { await repo.remove(id); setRows(prev => prev.filter(r => r[pkField] !== id)); return true; }
    catch(e: any) { setError(e.message ?? "Error al eliminar"); return false; }
  }, [repo, pkField]);

  const searched  = rows.filter(r =>
    !search || Object.values(r).some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(searched.length / PAGE);
  const paginated  = searched.slice(page * PAGE, (page+1) * PAGE);

  return { rows: paginated, allRows: searched, loading, saving, error,
           search, setSearch, page, setPage, totalPages, load, create, update, remove };
}
