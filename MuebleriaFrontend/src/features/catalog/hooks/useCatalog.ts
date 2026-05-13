// features/catalog/hooks/useCatalog.ts
import { useState, useEffect, useCallback } from "react";
import { catalogRepository } from "../data/catalogRepository";
import { filterProducts, defaultFilters, type CatalogFilters } from "../domain/catalogDomain";
import type { Articulo } from "../../../core/types";

export function useCatalog() {
  const [all,     setAll]     = useState<Articulo[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAll(await catalogRepository.getAll()); }
    catch(e: any) { setError(e.message ?? "Error al cargar"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateFilter = <K extends keyof CatalogFilters>(k: K, v: CatalogFilters[K]) =>
    setFilters(f => ({ ...f, [k]: v }));

  return { products: filterProducts(all, filters), filters, updateFilter, loading, error, reload: load };
}

export function useProduct(id: number | null) {
  const [product, setProduct] = useState<Articulo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    catalogRepository.getById(id)
      .then(setProduct)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
