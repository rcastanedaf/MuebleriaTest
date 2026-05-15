import { createContext, useContext } from "react";
import type { CartItem, Articulo } from "../core/types";

interface CartStore {
  items: CartItem[];
  addItem: (a: Articulo) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clear: () => void;
  total: number;
}

export const CartCtx = createContext<CartStore>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clear: () => {},
  total: 0,
});

export const useCart = () => useContext(CartCtx);
