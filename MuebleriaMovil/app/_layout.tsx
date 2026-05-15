import React, { useState, useMemo } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { AuthUser, CartItem, Articulo } from "../core/types";
import { AuthCtx } from "../store/authStore";
import { CartCtx } from "../store/cartStore";
import { tokenStorage } from "../core/api/apiClient";

export default function RootLayout() {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const authValue = useMemo(() => ({
    user,
    setUser: async (u: AuthUser) => {
      await tokenStorage.set(u.token);
      setUserState(u);
    },
    clearUser: async () => {
      await tokenStorage.clear();
      setUserState(null);
    },
  }), [user]);

  const cartValue = useMemo(() => ({
    items: cartItems,
    addItem: (a: Articulo) => setCartItems(prev => {
      const exists = prev.find(i => i.articulo.idArticulo === a.idArticulo);
      if (exists) return prev.map(i => i.articulo.idArticulo === a.idArticulo
        ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { articulo: a, cantidad: 1 }];
    }),
    removeItem: (id: number) => setCartItems(prev => prev.filter(i => i.articulo.idArticulo !== id)),
    updateQty: (id: number, qty: number) => setCartItems(prev =>
      qty <= 0
        ? prev.filter(i => i.articulo.idArticulo !== id)
        : prev.map(i => i.articulo.idArticulo === id ? { ...i, cantidad: qty } : i)
    ),
    clear: () => setCartItems([]),
    total: cartItems.reduce((s, i) => s + i.articulo.precio * i.cantidad, 0),
  }), [cartItems]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthCtx.Provider value={authValue}>
          <CartCtx.Provider value={cartValue}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </CartCtx.Provider>
        </AuthCtx.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
