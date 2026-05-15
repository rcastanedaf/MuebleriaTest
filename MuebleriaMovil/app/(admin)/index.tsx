import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { apiClient } from "../../core/api/apiClient";
import { C } from "../../components/ui";
import { useAuth } from "../../store/authStore";

interface Stats {
  articulosActivos: number;
  ordenesPendientes: number;
  clientesActivos: number;
  despachosEnRuta: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get<Stats>("/dashboard/stats").then(setStats).catch(() => {});
  }, []);

  const cards = [
    { icon: "🪑", label: "Artículos activos",  value: stats?.articulosActivos,  color: C.olive },
    { icon: "🛒", label: "Órdenes pendientes", value: stats?.ordenesPendientes, color: C.gold  },
    { icon: "👤", label: "Clientes activos",   value: stats?.clientesActivos,   color: "#1e4fa0" },
    { icon: "🚛", label: "Despachos en ruta",  value: stats?.despachosEnRuta,   color: C.success },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 14, color: C.txtMuted, marginBottom: 16 }}>
        Bienvenido, {user?.username}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {cards.map(c => (
          <View key={c.label} style={{
            backgroundColor: C.bg3, borderRadius: 12, borderWidth: 1, borderColor: C.sand,
            borderLeftWidth: 3, borderLeftColor: c.color,
            padding: 14, width: "47%",
          }}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</Text>
            {c.value === undefined
              ? <ActivityIndicator color={c.color} />
              : <Text style={{ fontSize: 22, fontWeight: "700", color: c.color }}>{c.value}</Text>
            }
            <Text style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: C.bg3, borderRadius: 12, borderWidth: 1, borderColor: C.sand, padding: 16 }}>
        <Text style={{ fontSize: 17, fontWeight: "300", color: C.dark, marginBottom: 6 }}>Sistema ERP activo</Text>
        <Text style={{ fontSize: 13, color: C.txtMuted, lineHeight: 20 }}>
          Panel administrativo de Muebles Los Alpes. Usa el menú ☰ para gestionar módulos.
        </Text>
      </View>
    </ScrollView>
  );
}
