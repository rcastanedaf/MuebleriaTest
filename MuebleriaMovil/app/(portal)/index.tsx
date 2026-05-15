import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../store/authStore";
import { useCart } from "../../store/cartStore";
import { useRouter } from "expo-router";
import { apiClient } from "../../core/api/apiClient";
import { AppModal, Button, StatusBadge, C } from "../../components/ui";
import type { Articulo } from "../../core/types";

function formatQTZ(n: number) {
  return `Q ${Number(n).toFixed(2)}`;
}

export default function CatalogScreen() {
  const { clearUser, user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Articulo | null>(null);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiClient.get<{ data: Articulo[] }>("/articulos");
      setArticulos((res as any).data ?? res ?? []);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = articulos.filter(a =>
    !search || a.nombreArticulo.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await clearUser();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: C.sand }}>
        <Text style={{ flex: 1, fontSize: 20, fontWeight: "300", color: C.dark }}>Catálogo</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ fontSize: 13, color: C.olive }}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{ padding: 12 }}>
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Buscar artículos..."
          placeholderTextColor={C.txtMuted}
          style={{
            backgroundColor: C.bg3, borderRadius: 8, borderWidth: 1,
            borderColor: C.sand, paddingHorizontal: 12, paddingVertical: 9,
            fontSize: 14, color: C.txt,
          }}
        />
      </View>

      {loading
        ? <ActivityIndicator color={C.olive} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={a => String(a.idArticulo)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.olive} />}
            contentContainerStyle={{ padding: 12, gap: 10 }}
            renderItem={({ item: a }) => (
              <TouchableOpacity
                onPress={() => setSelected(a)}
                style={{
                  backgroundColor: C.bg3, borderRadius: 12, borderWidth: 1,
                  borderColor: C.sand, padding: 14,
                  flexDirection: "row", alignItems: "center", gap: 12,
                }}
              >
                <Text style={{ fontSize: 36 }}>{a.tipoArticulo === "Exterior" ? "🌿" : "🪑"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: C.txt, marginBottom: 2 }}>{a.nombreArticulo}</Text>
                  <Text style={{ fontSize: 13, color: C.gold, fontWeight: "600" }}>{formatQTZ(a.precio)}</Text>
                  <Text style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>
                    Stock: {a.stockDisponible} {a.tipoArticulo ? `· ${a.tipoArticulo}` : ""}
                  </Text>
                </View>
                <StatusBadge status={a.estadoArticulo} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: C.txtMuted, marginTop: 40 }}>Sin artículos</Text>
            }
          />
        )
      }

      {/* Product detail modal */}
      <AppModal visible={!!selected} onClose={() => setSelected(null)} title={selected?.nombreArticulo}>
        {selected && (
          <View>
            <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>
              {selected.tipoArticulo === "Exterior" ? "🌿" : "🪑"}
            </Text>
            {selected.descripcionArticulo && (
              <Text style={{ fontSize: 13, color: C.txtMid, lineHeight: 20, marginBottom: 12 }}>
                {selected.descripcionArticulo}
              </Text>
            )}
            <Text style={{ fontSize: 22, fontWeight: "700", color: C.olive, marginBottom: 4 }}>
              {formatQTZ(selected.precio)}
            </Text>
            <Text style={{ fontSize: 12, color: C.txtMuted, marginBottom: 16 }}>
              Stock disponible: {selected.stockDisponible}
            </Text>
            <Button
              onPress={() => { addItem(selected); setSelected(null); }}
              disabled={selected.stockDisponible === 0}
            >
              {selected.stockDisponible > 0 ? "Agregar al carrito" : "Sin stock"}
            </Button>
          </View>
        )}
      </AppModal>
    </SafeAreaView>
  );
}
