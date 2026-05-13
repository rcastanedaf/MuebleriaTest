// features/cart/domain/cartDomain.ts
import type { CartItem, Articulo } from "../../../core/types";

export const TAX = 0.12;
let _id = 0;

export const getSubtotal = (items: CartItem[]) => items.reduce((s,i) => s + i.precio * i.qty, 0);
export const getTax      = (items: CartItem[]) => getSubtotal(items) * TAX;
export const getTotal    = (items: CartItem[]) => getSubtotal(items) + getTax(items);
export const getTotalQty = (items: CartItem[]) => items.reduce((s,i) => s + i.qty, 0);

export function addItem(items: CartItem[], p: Articulo): CartItem[] {
  const ex = items.find(i => i.idArticulo === p.idArticulo);
  if (ex) return items.map(i => i.idArticulo === p.idArticulo ? { ...i, qty: i.qty + 1 } : i);
  return [...items, {
    cartId: ++_id, idArticulo: p.idArticulo,
    codigoArticulo: p.codigoArticulo, nombreArticulo: p.nombreArticulo,
    tipoArticulo: p.tipoArticulo, precio: p.precio ?? 0,
    qty: 1, stock: p.stockDisponible ?? 0,
  }];
}
export const removeItem    = (items: CartItem[], cartId: number) => items.filter(i => i.cartId !== cartId);
export const updateItemQty = (items: CartItem[], cartId: number, qty: number) =>
  qty < 1 ? removeItem(items, cartId)
           : items.map(i => i.cartId === cartId ? { ...i, qty: Math.min(qty, i.stock) } : i);
export const clearCart = (): CartItem[] => [];

export function validateCart(items: CartItem[]) {
  if (items.length === 0) return { valid: false, reason: "El carrito está vacío" };
  const over = items.find(i => i.qty > i.stock);
  if (over) return { valid: false, reason: `Stock insuficiente: ${over.nombreArticulo}` };
  return { valid: true };
}
