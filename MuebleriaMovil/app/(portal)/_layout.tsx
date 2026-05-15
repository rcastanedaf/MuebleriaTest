import { Tabs } from "expo-router";
import { useCart } from "../../store/cartStore";
import { C } from "../../components/ui";
import { Text } from "react-native";

export default function PortalLayout() {
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.olive,
      tabBarInactiveTintColor: C.txtMuted,
      tabBarStyle: { backgroundColor: C.bg3, borderTopColor: C.sand },
    }}>
      <Tabs.Screen name="index"  options={{ title: "Catálogo", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🪑</Text> }} />
      <Tabs.Screen name="cart"   options={{
        title: "Carrito",
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        tabBarBadge: cartCount > 0 ? cartCount : undefined,
      }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }} />
    </Tabs>
  );
}
