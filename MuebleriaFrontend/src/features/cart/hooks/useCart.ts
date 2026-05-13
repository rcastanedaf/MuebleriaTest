// features/cart/hooks/useCart.ts
import { useCallback } from "react";
import { useCartStore } from "../../../store/cartStore";
import { addItem, removeItem, updateItemQty, clearCart,
         getSubtotal, getTax, getTotal, getTotalQty, validateCart } from "../domain/cartDomain";
import type { Articulo } from "../../../core/types";

export function useCart() {
  const { items, setItems } = useCartStore();
  return {
    items,
    add:       useCallback((p: Articulo)           => setItems(addItem(items, p)), [items, setItems]),
    remove:    useCallback((cartId: number)         => setItems(removeItem(items, cartId)), [items, setItems]),
    updateQty: useCallback((cartId: number, qty: number) => setItems(updateItemQty(items, cartId, qty)), [items, setItems]),
    clear:     useCallback(()                       => setItems(clearCart()), [setItems]),
    subtotal:  getSubtotal(items),
    tax:       getTax(items),
    total:     getTotal(items),
    totalQty:  getTotalQty(items),
    validation: validateCart(items),
  };
}
