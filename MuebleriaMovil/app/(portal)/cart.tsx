import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../store/cartStore";
import { useAuth } from "../../store/authStore";
import { apiClient } from "../../core/api/apiClient";
import { Button, C } from "../../components/ui";

function formatQTZ(n: number) { return `Q ${Number(n).toFixed(2)}`; }

export default function CartScreen() {
  const { items, removeItem, updateQty, clear, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) { Alert.alert("Error", "Debes iniciar sesión"); return; }
    setLoading(true);
    try {
      await apiClient.post("/ordenes-venta", {
        detalles: items.map(i => ({
          idArticulo: i.articulo.idArticulo,
          cantidad: i.cantidad,
          precioUnitario: i.articulo.precio,
        })),
      });
      clear();
      Alert.alert("Pedido realizado", "Tu pedido fue enviado exitosamente.");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo procesar el pedido");
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
        <Text style={{ fontSize: 16, color: C.txtMuted }}>Tu carrito está vacío</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.sand }}>
        <Text style={{ fontSize: 20, fontWeight: "300", color: C.dark }}>Carrito</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => String(i.articulo.idArticulo)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: C.bg3, borderRadius: 12, borderWidth: 1,
            borderColor: C.sand, padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
          }}>
            <Text style={{ fontSize: 30 }}>{item.articulo.tipoArticulo === "Exterior" ? "🌿" : "🪑"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: C.txt }}>{item.articulo.nombreArticulo}</Text>
              <Text style={{ fontSize: 13, color: C.gold }}>{formatQTZ(item.articulo.precio * item.cantidad)}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => updateQty(item.articulo.idArticulo, item.cantidad - 1)}
                  style={{ backgroundColor: C.sand, borderRadius: 6, width: 28, height: 28, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16, color: C.txt }}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 14, fontWeight: "600", color: C.txt, minWidth: 20, textAlign: "center" }}>{item.cantidad}</Text>
                <TouchableOpacity
                  onPress={() => updateQty(item.articulo.idArticulo, item.cantidad + 1)}
                  style={{ backgroundColor: C.sand, borderRadius: 6, width: 28, height: 28, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16, color: C.txt }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.articulo.idArticulo)}>
              <Text style={{ fontSize: 18, color: C.danger }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: C.sand, backgroundColor: C.bg3 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: C.txtMid }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: C.olive }}>{formatQTZ(total)}</Text>
        </View>
        <Button onPress={handleCheckout} loading={loading}>Confirmar pedido</Button>
      </View>
    </SafeAreaView>
  );
}
