import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiClient } from "../../core/api/apiClient";
import { Button, Input, Select, AppModal, ConfirmDialog, StatusBadge, C } from "../../components/ui";

// ── Module config ─────────────────────────────────────────────
interface ModuleCfg {
  title: string;
  endpoint: string;
  pk: string;
  displayCols: string[];
  formCols: string[];
}

const MODULES: Record<string, ModuleCfg> = {
  empleados:      { title:"Empleados",       endpoint:"empleados",         pk:"idEmpleado",          displayCols:["nombresEmpleado","apellidosEmpleado","estadoEmpleado"],             formCols:["numeroEmpleado","nombresEmpleado","apellidosEmpleado","estadoEmpleado"] },
  nomina:         { title:"Nómina",          endpoint:"nomina",            pk:"idNomina",            displayCols:["periodoNomina","totalNetoNomina","estadoNomina"],                   formCols:["periodoNomina","fechaPagoNomina","totalNetoNomina","estadoNomina"] },
  articulos:      { title:"Artículos",       endpoint:"articulos",         pk:"idArticulo",          displayCols:["nombreArticulo","precio","stockDisponible","estadoArticulo"],       formCols:["codigoArticulo","nombreArticulo","tipoArticulo","precio","stockDisponible","estadoArticulo"] },
  bodegas:        { title:"Bodegas",         endpoint:"bodegas",           pk:"idBodega",            displayCols:["nombreBodega","tipoBodega","estadoBodega"],                         formCols:["codigoBodega","nombreBodega","tipoBodega","estadoBodega"] },
  proveedores:    { title:"Proveedores",     endpoint:"proveedores",       pk:"idProveedor",         displayCols:["razonSocialProveedor","nitProveedor","estadoProveedor"],            formCols:["codigoProveedor","razonSocialProveedor","nitProveedor","emailProveedor","estadoProveedor"] },
  "ordenes-compra": { title:"Órd. Compra",  endpoint:"ordenes-compra",    pk:"idOrdenCompra",       displayCols:["numeroOrdenCompra","totalOrdenCompra","estadoOrdenCompra"],        formCols:["estadoOrdenCompra"] },
  clientes:       { title:"Clientes",        endpoint:"clientes",          pk:"idCliente",           displayCols:["razonSocialCliente","nitCliente","estadoCliente"],                  formCols:["codigoCliente","razonSocialCliente","nitCliente","emailCliente","estadoCliente"] },
  "ordenes-venta": { title:"Órd. Venta",    endpoint:"ordenes-venta",     pk:"idOrdenVenta",        displayCols:["numeroOrdenVenta","totalOrdenVenta","estadoOrdenVenta"],           formCols:["estadoOrdenVenta"] },
  produccion:     { title:"Producción",      endpoint:"ordenes-produccion",pk:"idOrdenProduccion",   displayCols:["codigoOrdenProduccion","cantidadPlanificadaOrdenProduccion","estadoOrdenProduccion"], formCols:["codigoOrdenProduccion","cantidadPlanificadaOrdenProduccion","estadoOrdenProduccion"] },
  vehiculos:      { title:"Vehículos",       endpoint:"vehiculos",         pk:"idVehiculo",          displayCols:["placaVehiculo","marcaVehiculo","estadoVehiculo"],                   formCols:["placaVehiculo","marcaVehiculo","modeloVehiculo","tipoVehiculo","estadoVehiculo"] },
  despachos:      { title:"Despachos",       endpoint:"ordenes-despacho",  pk:"idOrdenDespacho",     displayCols:["nombreOrdenDespacho","estadoOrdenDespachado"],                     formCols:["nombreOrdenDespacho","estadoOrdenDespachado"] },
  usuarios:       { title:"Usuarios",        endpoint:"usuarios",          pk:"idUsuario",           displayCols:["usernameUsuario","emailUsuario","estadoUsuario"],                   formCols:["usernameUsuario","emailUsuario","estadoUsuario"] },
  sucursales:     { title:"Sucursales",      endpoint:"sucursales",        pk:"idSucursal",          displayCols:["nombreSucursal","emailSucursal","estadoSucursal"],                  formCols:["codigoSucursal","nombreSucursal","emailSucursal","estadoSucursal","nombreEmpresa"] },
  roles:          { title:"Roles",           endpoint:"roles",             pk:"idRol",               displayCols:["nombreRol","rangoRol"],                                              formCols:["nombreRol","descripcionRol","rangoRol"] },
};

// ── Field helpers ─────────────────────────────────────────────
const STATUS_OPTIONS: Record<string, Array<{value:string;label:string}>> = {
  estadoNomina:           [{ value:"A",label:"Activo" },{ value:"I",label:"Inactivo" },{ value:"C",label:"Cancelado" }],
  estadoOrdenVenta:       [{ value:"P",label:"Pendiente" },{ value:"A",label:"Aprobada" },{ value:"D",label:"Despachada" },{ value:"F",label:"Finalizada" },{ value:"C",label:"Cancelada" }],
  estadoOrdenCompra:      [{ value:"P",label:"Pendiente" },{ value:"A",label:"Aprobada" },{ value:"R",label:"Rechazada" },{ value:"C",label:"Cancelada" }],
  estadoOrdenDespachado:  [{ value:"P",label:"Pendiente" },{ value:"D",label:"Despachado" },{ value:"E",label:"En ruta" },{ value:"C",label:"Cancelado" }],
  estadoOrdenProduccion:  [{ value:"P",label:"Pendiente" },{ value:"E",label:"En proceso" },{ value:"C",label:"Completado" },{ value:"R",label:"Rechazado" }],
  defaultEstado:          [{ value:"A",label:"Activo" },{ value:"I",label:"Inactivo" }],
};

function getStatusOptions(field: string) {
  return STATUS_OPTIONS[field] ?? (field.toLowerCase().includes("estado") ? STATUS_OPTIONS.defaultEstado : null);
}

function colLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

function formatVal(col: string, val: any): string {
  if (val === null || val === undefined) return "—";
  if (col.toLowerCase().includes("precio") || col.toLowerCase().includes("total") || col.toLowerCase().includes("neto"))
    return `Q ${Number(val).toFixed(2)}`;
  return String(val);
}

const NUMERIC_KEYS = ["precio","total","cantidad","stock","rango","capacidad","salario","bonificacion","descuento","neto","bruto","horas"];
function isNumeric(col: string) { return NUMERIC_KEYS.some(k => col.toLowerCase().includes(k)); }

// Key remapping: display field → actual ID field for backend
const NAME_TO_ID: Record<string, string> = { nombreEmpresa: "idEmpresa" };

// ── Main component ────────────────────────────────────────────
export default function CrudScreen() {
  const { module } = useLocalSearchParams<{ module: string }>();
  const cfg = MODULES[module ?? ""] ?? null;

  const [rows,     setRows]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen,  setDelOpen]  = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [delId,    setDelId]    = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string,string>>({});

  // Dynamic options
  const [empresas, setEmpresas] = useState<Array<{value:string;label:string}>>([]);

  const load = useCallback(async () => {
    if (!cfg) return;
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/${cfg.endpoint}`);
      setRows((res as any).data ?? res ?? []);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  }, [cfg]);

  useEffect(() => { load(); }, [load]);

  // Load dynamic options
  useEffect(() => {
    if (!cfg) return;
    if (cfg.formCols.includes("nombreEmpresa")) {
      apiClient.get<any>("/empresas").then(r => {
        const list = (r as any).data ?? r ?? [];
        setEmpresas(list.map((x: any) => ({ value: String(x.idEmpresa), label: x.nombreEmpresa })));
      }).catch(() => {});
    }
  }, [cfg]);

  const getOptions = (col: string) => {
    if (col === "nombreEmpresa") return empresas;
    return getStatusOptions(col);
  };

  const setField = (k: string, v: string) => setFormData(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setSelected(null);
    const fd: Record<string,string> = {};
    cfg?.formCols.forEach(c => { fd[c] = ""; });
    setFormData(fd);
    setEditOpen(true);
  };

  const openEdit = (row: any) => {
    setSelected(row);
    const fd: Record<string,string> = {};
    cfg?.formCols.forEach(c => { fd[c] = String(row[c] ?? ""); });
    setFormData(fd);
    setEditOpen(true);
  };

  const buildPayload = () => {
    const out: Record<string,any> = {};
    for (const [k, v] of Object.entries(formData)) {
      const idKey = NAME_TO_ID[k];
      if (idKey) { out[idKey] = v === "" ? null : Number(v); continue; }
      out[k] = isNumeric(k) ? (v === "" ? null : Number(v)) : v;
    }
    return out;
  };

  const handleSave = async () => {
    if (!cfg) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      if (selected) {
        await apiClient.put(`/${cfg.endpoint}/${selected[cfg.pk]}`, payload);
      } else {
        await apiClient.post(`/${cfg.endpoint}`, payload);
      }
      setEditOpen(false);
      await load();
    } catch (e: any) { Alert.alert("Error", e.message ?? "Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!cfg || !delId) return;
    try {
      await apiClient.delete(`/${cfg.endpoint}/${delId}`);
      setDelOpen(false);
      await load();
    } catch (e: any) { Alert.alert("Error", e.message ?? "Error al eliminar"); }
  };

  const filtered = rows.filter(r =>
    !search || cfg?.displayCols.some(c => String(r[c] ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  if (!cfg) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: C.txtMuted }}>Módulo no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Toolbar */}
      <View style={{ flexDirection: "row", gap: 10, padding: 12, alignItems: "center" }}>
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Buscar..."
          placeholderTextColor={C.txtMuted}
          style={{
            flex: 1, backgroundColor: C.bg3, borderRadius: 8, borderWidth: 1,
            borderColor: C.sand, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.txt,
          }}
        />
        <Button onPress={openCreate} style={{ paddingHorizontal: 12 }}>+ Nuevo</Button>
      </View>

      <Text style={{ paddingHorizontal: 12, fontSize: 11, color: C.txtMuted, marginBottom: 4 }}>
        {cfg.title} · {filtered.length} registros
      </Text>

      {loading
        ? <ActivityIndicator color={C.olive} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={r => String(r[cfg.pk])}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={C.olive} />}
            renderItem={({ item: row }) => (
              <View style={{
                backgroundColor: C.bg3, borderRadius: 10, borderWidth: 1,
                borderColor: C.sand, padding: 12,
              }}>
                {cfg.displayCols.map(col => (
                  <View key={col} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: C.txtMuted, flex: 1 }}>{colLabel(col)}</Text>
                    {col.toLowerCase().includes("estado")
                      ? <StatusBadge status={String(row[col] ?? "")} />
                      : <Text style={{ fontSize: 13, color: C.txt, flex: 2, textAlign: "right" }}>{formatVal(col, row[col])}</Text>
                    }
                  </View>
                ))}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => openEdit(row)}
                    style={{ flex: 1, borderWidth: 1, borderColor: C.sand, borderRadius: 6, padding: 6, alignItems: "center" }}>
                    <Text style={{ fontSize: 12, color: C.txtMid }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDelId(row[cfg.pk]); setDelOpen(true); }}
                    style={{ flex: 1, borderWidth: 1, borderColor: "rgba(184,50,50,0.3)", borderRadius: 6, padding: 6, alignItems: "center" }}>
                    <Text style={{ fontSize: 12, color: C.danger }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: C.txtMuted, marginTop: 40 }}>Sin registros</Text>
            }
          />
        )
      }

      {/* Create / Edit modal */}
      <AppModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title={selected ? `Editar ${cfg.title}` : `Nuevo ${cfg.title}`}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {cfg.formCols.map(col => {
            const opts = getOptions(col);
            return opts
              ? <Select key={col} label={colLabel(col)} value={formData[col] ?? ""} onChange={v => setField(col, v)} options={opts} />
              : <Input key={col} label={colLabel(col)} value={formData[col] ?? ""} onChangeText={v => setField(col, v)}
                  keyboardType={isNumeric(col) ? "numeric" : "default"} />;
          })}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onPress={() => setEditOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
            <Button onPress={handleSave} loading={saving} style={{ flex: 1 }}>
              {selected ? "Actualizar" : "Crear"}
            </Button>
          </View>
        </ScrollView>
      </AppModal>

      <ConfirmDialog
        visible={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar registro"
        message="¿Está seguro? Esta acción no se puede deshacer."
      />
    </View>
  );
}
