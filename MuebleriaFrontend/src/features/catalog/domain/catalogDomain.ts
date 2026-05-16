// features/catalog/domain/catalogDomain.ts
import type { Articulo } from "../../../core/types";

export type TipoFilter  = "all" | "Interior" | "Exterior";
export type SortOption  = "name" | "price" | "price_desc";
export interface CatalogFilters { tipo: TipoFilter; search: string; sortBy: SortOption; }
export const defaultFilters: CatalogFilters = { tipo: "all", search: "", sortBy: "name" };

const getArticuloPrice = (p: Articulo) =>
  p.precio ?? (p as any).precio ?? (p as any).precioListaPreciosDet ?? 0;
const getArticuloStock = (p: Articulo) =>
  p.stockDisponible ?? (p as any).cantidadDiponibleStockArticulo ?? (p as any).stock_disponible ?? 0;

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
    case "price":      r.sort((a,b) => getArticuloPrice(a) - getArticuloPrice(b)); break;
    case "price_desc": r.sort((a,b) => getArticuloPrice(b) - getArticuloPrice(a)); break;
    default:           r.sort((a,b) => a.nombreArticulo.localeCompare(b.nombreArticulo));
  }
  return r;
}
export const inStock   = (p: Articulo) => getArticuloStock(p) > 0;
export const formatPrice = (n: number) =>
  `Q ${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
