// features/catalog/domain/catalogDomain.ts
import type { Articulo } from "../../../core/types";

export type TipoFilter  = "all" | "Interior" | "Exterior";
export type SortOption  = "name" | "price" | "price_desc";
export interface CatalogFilters { tipo: TipoFilter; search: string; sortBy: SortOption; }
export const defaultFilters: CatalogFilters = { tipo: "all", search: "", sortBy: "name" };

export function filterProducts(products: Articulo[], f: CatalogFilters): Articulo[] {
  let r = [...products];
  if (f.tipo !== "all") r = r.filter(p => p.tipoArticulo === f.tipo);
  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    r = r.filter(p =>
      p.nombreArticulo.toLowerCase().includes(q) ||
      p.codigoArticulo.toLowerCase().includes(q)
    );
  }
  switch(f.sortBy) {
    case "price":      r.sort((a,b) => (a.precio??0)-(b.precio??0)); break;
    case "price_desc": r.sort((a,b) => (b.precio??0)-(a.precio??0)); break;
    default:           r.sort((a,b) => a.nombreArticulo.localeCompare(b.nombreArticulo));
  }
  return r;
}
export const inStock   = (p: Articulo) => (p.stockDisponible ?? 0) > 0;
export const formatPrice = (n: number) =>
  `Q ${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
