import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "../../core/api/apiClient";
import { AppModal, StatusBadge, C } from "../../components/ui";
import type { OrdenVenta, OrdenVentaCompleta } from "../../core/types";
import { TouchableOpacity } from "react-native";

function formatQTZ(n: number) { return `Q ${Number(n).toFixed(2)}`; }

export default function OrdersScreen() {
  const [orders, setOrders]   = useState<OrdenVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<OrdenVentaCompleta | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiClient.get<any>("/ordenes-venta/mis-ordenes");
      setOrders((res as any).data ?? res ?? []);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get<OrdenVentaCompleta>(`/ordenes-venta/${id}`);
      setSelected(res);
    } catch { }
    finally { setDetailLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusLabel: Record<string, string> = {
    P: "Pendiente", A: "Aprobada", D: "Despachada", F: "Finalizada", C: "Cancelada",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.sand }}>
        <Text style={{ fontSize: 20, fontWeight: "300", color: C.dark }}>Mis pedidos</Text>
      </View>

      {loading
        ? <ActivityIndicator color={C.olive} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={orders}
            keyExtractor={o => String(o.idOrdenVenta)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.olive} />}
            contentContainerStyle={{ padding: 12, gap: 10 }}
            renderItem={({ item: o }) => (
              <TouchableOpacity
                onPress={() => loadDetail(o.idOrdenVenta)}
                style={{
                  backgroundColor: C.bg3, borderRadius: 12, borderWidth: 1,
                  borderColor: C.sand, padding: 14,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: C.txt }}>{o.numeroOrdenVenta}</Text>
                  <StatusBadge status={o.estadoOrdenVenta} />
                </View>
                <Text style={{ fontSize: 12, color: C.txtMuted }}>{o.fechaSolicitudOrdenVenta}</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: C.olive, marginTop: 4 }}>{formatQTZ(o.totalOrdenVenta)}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: C.txtMuted, marginTop: 40 }}>Sin pedidos</Text>
            }
          />
        )
      }

      <AppModal visible={!!selected || detailLoading} onClose={() => setSelected(null)} title="Detalle del pedido">
        {detailLoading
          ? <ActivityIndicator color={C.olive} />
          : selected && (
            <View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: C.txt }}>{selected.cabecera.numeroOrdenVenta}</Text>
              <Text style={{ fontSize: 12, color: C.txtMuted, marginTop: 2 }}>{selected.cabecera.fechaSolicitudOrdenVenta}</Text>
              <StatusBadge status={selected.cabecera.estadoOrdenVenta} />
              <View style={{ height: 1, backgroundColor: C.sand, marginVertical: 12 }} />
              {selected.detalles.map((d, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ flex: 1, fontSize: 13, color: C.txt }}>{d.nombreArticulo} x{d.cantidadOrdenVenta}</Text>
                  <Text style={{ fontSize: 13, color: C.txtMid }}>{formatQTZ(d.subtotalOrdenVenta)}</Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: C.sand, marginVertical: 8 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, fontWeight: "600" }}>Total</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: C.olive }}>{formatQTZ(selected.cabecera.totalOrdenVenta)}</Text>
              </View>
            </View>
          )
        }
      </AppModal>
    </SafeAreaView>
  );
}
