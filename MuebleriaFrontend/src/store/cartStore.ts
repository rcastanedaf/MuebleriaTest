// store/cartStore.ts
import { createContext, useContext } from "react";
import type { CartItem } from "../core/types";

interface CartState { items: CartItem[]; setItems: (items: CartItem[]) => void; }
const CartStoreCtx = createContext<CartState>({ items: [], setItems: () => {} });
export const useCartStore = () => useContext(CartStoreCtx);
export { CartStoreCtx };
