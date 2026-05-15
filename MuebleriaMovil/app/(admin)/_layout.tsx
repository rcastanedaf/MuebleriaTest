import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../store/authStore";
import { C } from "../../components/ui";

const MODULES = [
  { key: "",            label: "Dashboard",      icon: "📊", group: "General" },
  { key: "sucursales",  label: "Sucursales",      icon: "🏢", group: "Config" },
  { key: "roles",       label: "Roles",           icon: "🔐", group: "Config" },
  { key: "usuarios",    label: "Usuarios",        icon: "👥", group: "Config" },
  { key: "empleados",   label: "Empleados",       icon: "👤", group: "RRHH" },
  { key: "nomina",      label: "Nómina",          icon: "💰", group: "RRHH" },
  { key: "articulos",   label: "Artículos",       icon: "🪑", group: "Inventario" },
  { key: "bodegas",     label: "Bodegas",         icon: "🏭", group: "Inventario" },
  { key: "proveedores", label: "Proveedores",     icon: "🚚", group: "Compras" },
  { key: "ordenes-compra", label: "Órd. Compra",  icon: "📋", group: "Compras" },
  { key: "clientes",    label: "Clientes",        icon: "🤝", group: "Ventas" },
  { key: "ordenes-venta",  label: "Órd. Venta",   icon: "🛒", group: "Ventas" },
  { key: "produccion",  label: "Producción",      icon: "⚙️", group: "Producción" },
  { key: "vehiculos",   label: "Vehículos",       icon: "🚛", group: "Transporte" },
  { key: "despachos",   label: "Despachos",       icon: "📦", group: "Transporte" },
];

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { clearUser } = useAuth();

  const navigate = (key: string) => {
    setDrawerOpen(false);
    if (key === "") router.push("/(admin)/");
    else router.push(`/(admin)/${key}` as any);
  };

  const handleLogout = async () => {
    await clearUser();
    router.replace("/login");
  };

  const groups = [...new Set(MODULES.map(m => m.group))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Topbar */}
      <View style={{
        flexDirection: "row", alignItems: "center", padding: 12,
        borderBottomWidth: 1, borderBottomColor: C.sand, backgroundColor: C.bg3,
      }}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)}
          style={{ padding: 6, borderWidth: 1, borderColor: C.sand, borderRadius: 8, marginRight: 12 }}>
          <Text style={{ fontSize: 16 }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 16, fontWeight: "300", color: C.dark }}>Panel Administrativo</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ fontSize: 13, color: C.olive }}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Drawer overlay */}
      {drawerOpen && (
        <Pressable
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" } as any}
          onPress={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <View style={{
        position: "absolute", top: 0, bottom: 0, left: drawerOpen ? 0 : -280,
        width: 260, backgroundColor: C.dark,
        shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10,
      }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>Muebles Los Alpes</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>Panel Administrativo</Text>
          </View>
          <ScrollView>
            {groups.map(group => (
              <View key={group} style={{ paddingTop: 12 }}>
                <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)", paddingHorizontal: 20, marginBottom: 4 }}>{group}</Text>
                {MODULES.filter(m => m.group === group).map(m => (
                  <TouchableOpacity key={m.key} onPress={() => navigate(m.key)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10,
                      paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>{m.icon}</Text>
                    <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}
