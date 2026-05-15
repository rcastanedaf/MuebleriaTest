// src/pages/admin/AdminApp.tsx
import React, { useState, useEffect } from "react";
import { Button, Badge, StatusBadge, Spinner, Modal, Input, Select, ConfirmDialog, Toast } from "../../shared/components";
import { apiClient } from "../../core/api/apiClient";
import { useCrud } from "../../features/admin/hooks/useCrud";
import { useDisclosure } from "../../shared/hooks";
import { formatQTZ, formatDate } from "../../shared/utils";
import {
  empleadosRepo, articulosRepo, proveedoresRepo, clientesRepo,
  ordenesVentaRepo, ordenesCompraRepo, vehiculosRepo, transportistasRepo,
  despachosRepo, ordenesProducRepo, nominaRepo, usuariosRepo,
  bodegasRepo, sucursalesRepo, rolesRepo, cargosRepo, listaPreciosRepo,
  centrosTrabajoRepo, bomRepo, empresasRepo,
} from "../../features/admin/data/adminRepository";

interface Props { showToast: (msg: string, type?: "success"|"error") => void; }

type Module =
  | "dashboard" | "empleados" | "nomina"
  | "articulos" | "bodegas"
  | "proveedores" | "ordenesCompra"
  | "clientes" | "ordenesVenta"
  | "produccion"
  | "vehiculos" | "despachos"
  | "usuarios" | "sucursales" | "roles";

const MODULES: Array<{ key: Module; label: string; icon: string; group: string }> = [
  { key:"dashboard",    label:"Dashboard",      icon:"📊", group:"General" },
  { key:"sucursales",   label:"Sucursales",     icon:"🏢", group:"Config" },
  { key:"roles",        label:"Roles",          icon:"🔐", group:"Config" },
  { key:"usuarios",     label:"Usuarios",       icon:"👥", group:"Config" },
  { key:"empleados",    label:"Empleados",      icon:"👤", group:"RRHH" },
  { key:"nomina",       label:"Nómina",         icon:"💰", group:"RRHH" },
  { key:"articulos",    label:"Artículos",      icon:"🪑", group:"Inventario" },
  { key:"bodegas",      label:"Bodegas",        icon:"🏭", group:"Inventario" },
  { key:"proveedores",  label:"Proveedores",    icon:"🚚", group:"Compras" },
  { key:"ordenesCompra",label:"Órdenes Compra", icon:"📋", group:"Compras" },
  { key:"clientes",     label:"Clientes",       icon:"🤝", group:"Ventas" },
  { key:"ordenesVenta", label:"Órdenes Venta",  icon:"🛒", group:"Ventas" },
  { key:"produccion",   label:"Producción",     icon:"⚙️", group:"Producción" },
  { key:"vehiculos",    label:"Vehículos",      icon:"🚛", group:"Transporte" },
  { key:"despachos",    label:"Despachos",      icon:"📦", group:"Transporte" },
];

export function AdminApp({ showToast }: Props) {
  const [active, setActive] = useState<Module>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  const groups = [...new Set(MODULES.map(m => m.group))];

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      {/* Sidebar overlay for mobile */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position:"fixed", top:0, left: sideOpen ? 0 : -240, zIndex:201,
        width:240, height:"100vh", overflowY:"auto",
        background:"var(--dark)", color:"#fff",
        transition:"left 0.25s ease", paddingBottom:32,
      }}>
        <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontFamily:"Cormorant Garamond, serif", fontSize:16, fontWeight:600, letterSpacing:"0.05em" }}>
            Muebles Los Alpes
          </p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Panel Administrativo</p>
        </div>

        {groups.map(group => (
          <div key={group} style={{ padding:"12px 0 0" }}>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                        color:"rgba(255,255,255,0.3)", padding:"0 20px 6px" }}>{group}</p>
            {MODULES.filter(m => m.group === group).map(m => (
              <button key={m.key} onClick={() => { setActive(m.key); setSideOpen(false); }} style={{
                width:"100%", padding:"9px 20px", display:"flex", alignItems:"center", gap:10,
                background: active===m.key ? "rgba(255,255,255,0.1)" : "transparent",
                border:"none", color: active===m.key ? "#fff" : "rgba(255,255,255,0.55)",
                fontSize:13, fontWeight: active===m.key ? 500 : 400, cursor:"pointer",
                borderLeft:`2px solid ${active===m.key ? "var(--gold)" : "transparent"}`,
                transition:"all 0.15s", textAlign:"left",
              }}>
                <span style={{ fontSize:16 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div style={{ flex:1, marginLeft:0, minHeight:"100vh", background:"var(--bg)" }}>
        {/* Topbar */}
        <header style={{
          position:"sticky", top:0, zIndex:100, height:52,
          background:"rgba(247,243,236,0.95)", backdropFilter:"blur(8px)",
          borderBottom:"1px solid var(--sand)", display:"flex",
          alignItems:"center", padding:"0 16px", gap:12,
        }}>
          <button onClick={() => setSideOpen(v => !v)} style={{
            background:"none", border:"1px solid var(--sand)", borderRadius:"var(--radius)",
            padding:"6px 10px", cursor:"pointer", fontSize:16,
          }}>☰</button>
          <h1 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:400 }}>
            {MODULES.find(m => m.key === active)?.label ?? "Dashboard"}
          </h1>
        </header>

        <main style={{ padding:"20px 16px" }}>
          {active === "dashboard" && <Dashboard />}
          {active === "empleados"   && <CrudTable repo={empleadosRepo}    pk="idEmpleado"    title="Empleados"      columns={["numeroEmpleado","nombresEmpleado","apellidosEmpleado","nombreCargoRRHH","estadoEmpleado"]} showToast={showToast} />}
          {active === "nomina"      && <CrudTable repo={nominaRepo}        pk="idNomina"       title="Nómina"         columns={["periodoNomina","fechaPagoNomina","totalNetoNomina","estadoNomina","nombreSucursal"]} showToast={showToast} />}
          {active === "articulos"   && <CrudTable repo={articulosRepo}     pk="idArticulo"    title="Artículos"      columns={["codigoArticulo","nombreArticulo","tipoArticulo","precio","stockDisponible","estadoArticulo"]} showToast={showToast} />}
          {active === "bodegas"     && <CrudTable repo={bodegasRepo}       pk="idBodega"      title="Bodegas"        columns={["codigoBodega","nombreBodega","tipoBodega","estadoBodega","nombreSucursal"]} showToast={showToast} />}
          {active === "proveedores" && <CrudTable repo={proveedoresRepo}   pk="idProveedor"   title="Proveedores"    columns={["codigoProveedor","razonSocialProveedor","nitProveedor","emailProveedor","estadoProveedor"]} showToast={showToast} />}
          {active === "ordenesCompra"&&<CrudTable repo={ordenesCompraRepo} pk="idOrdenCompra" title="Órdenes Compra" columns={["numeroOrdenCompra","fechaSolicitudOrdenCompra","razonSocialProveedor","totalOrdenCompra","estadoOrdenCompra"]} showToast={showToast} />}
          {active === "clientes"    && <CrudTable repo={clientesRepo}      pk="idCliente"     title="Clientes"       columns={["codigoCliente","razonSocialCliente","nitCliente","emailCliente","estadoCliente"]} showToast={showToast} />}
          {active === "ordenesVenta"&& <CrudTable repo={ordenesVentaRepo}  pk="idOrdenVenta"  title="Órdenes Venta"  columns={["numeroOrdenVenta","fechaSolicitudOrdenVenta","totalOrdenVenta","estadoOrdenVenta"]} showToast={showToast} />}
          {active === "produccion"  && <CrudTable repo={ordenesProducRepo} pk="idOrdenProduccion" title="Producción" columns={["codigoOrdenProduccion","nombreListaMateriales","cantidadPlanificadaOrdenProduccion","estadoOrdenProduccion"]} showToast={showToast} />}
          {active === "vehiculos"   && <CrudTable repo={vehiculosRepo}     pk="idVehiculo"    title="Vehículos"      columns={["placaVehiculo","marcaVehiculo","modeloVehiculo","tipoVehiculo","estadoVehiculo"]} showToast={showToast} />}
          {active === "despachos"   && <CrudTable repo={despachosRepo}     pk="idOrdenDespacho" title="Despachos"    columns={["nombreOrdenDespacho","fechaCreaOrdenDespacho","placaVehiculo","nombreTransportista","estadoOrdenDespachado"]} showToast={showToast} />}
          {active === "usuarios"    && <CrudTable repo={usuariosRepo}      pk="idUsuario"     title="Usuarios"       columns={["usernameUsuario","emailUsuario","nombreRol","estadoUsuario","ultimoAccesoUsuario"]} showToast={showToast} />}
          {active === "sucursales"  && <CrudTable repo={sucursalesRepo}    pk="idSucursal"    title="Sucursales"     columns={["codigoSucursal","nombreSucursal","emailSucursal","estadoSucursal","nombreEmpresa"]} showToast={showToast} />}
          {active === "roles"       && <CrudTable repo={rolesRepo}         pk="idRol"         title="Roles"          columns={["nombreRol","descripcionRol","rangoRol"]} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
interface DashboardStats {
  articulosActivos:  number;
  ordenesPendientes: number;
  clientesActivos:   number;
  despachosEnRuta:   number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiClient.get<DashboardStats>("/dashboard/stats")
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const cards = [
    { icon:"🪑", label:"Artículos activos",  value: stats ? String(stats.articulosActivos)  : "…", color:"var(--olive)" },
    { icon:"🛒", label:"Órdenes pendientes", value: stats ? String(stats.ordenesPendientes) : "…", color:"var(--gold)"  },
    { icon:"👤", label:"Clientes activos",   value: stats ? String(stats.clientesActivos)   : "…", color:"#1e4fa0"      },
    { icon:"🚛", label:"Despachos en ruta",  value: stats ? String(stats.despachosEnRuta)   : "…", color:"#2e6b4f"      },
  ];

  return (
    <div className="fadeUp">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12, marginBottom:24 }}>
        {cards.map(s => (
          <div key={s.label} style={{
            padding:"18px 16px", background:"var(--bg3)", border:"1px solid var(--sand)",
            borderRadius:"var(--radiusLg)", borderLeft:`3px solid ${s.color}`,
          }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:700, color:s.color, marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:11, color:"var(--txtMuted)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"20px", background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radiusLg)" }}>
        <p style={{ fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:400, marginBottom:8 }}>Sistema ERP activo</p>
        <p style={{ fontSize:13, color:"var(--txtMuted)", lineHeight:1.7 }}>
          Panel administrativo de Muebles Los Alpes. Selecciona un módulo en el menú lateral
          para gestionar empleados, inventario, compras, ventas, producción y transporte.
        </p>
      </div>
    </div>
  );
}

// ── Generic CRUD Table ────────────────────────────────────────
function CrudTable<T extends Record<string,any>>({
  repo, pk, title, columns, showToast,
}: {
  repo: any; pk: string; title: string; columns: string[];
  showToast: (m: string, t?: "success"|"error") => void;
}) {
  const crud = useCrud<T>(repo, pk);
  const editModal   = useDisclosure();
  const deleteModal = useDisclosure();
  const [selected,  setSelected]  = useState<T | null>(null);
  const [formData,  setFormData]  = useState<Record<string,string>>({});
  const [deleteId,  setDeleteId]  = useState<number | null>(null);

  // Options for select fields
  const [sucursales, setSucursales] = useState<Array<{value: string, label: string}>>([]);
  const [roles, setRoles] = useState<Array<{value: string, label: string}>>([]);
  const [cargos, setCargos] = useState<Array<{value: string, label: string}>>([]);
  const [proveedores, setProveedores] = useState<Array<{value: string, label: string}>>([]);
  const [listasPrecios, setListasPrecios] = useState<Array<{value: string, label: string}>>([]);
  const [empleados, setEmpleados] = useState<Array<{value: string, label: string}>>([]);
  const [vehiculos, setVehiculos] = useState<Array<{value: string, label: string}>>([]);
  const [transportistas, setTransportistas] = useState<Array<{value: string, label: string}>>([]);
  const [centrosTrabajo, setCentrosTrabajo] = useState<Array<{value: string, label: string}>>([]);
  const [listasMateriales, setListasMateriales] = useState<Array<{value: string, label: string}>>([]);
  const [empresas, setEmpresas] = useState<Array<{value: string, label: string}>>([]);

  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        if (columns.includes('idSucursal') || columns.includes('nombreSucursal')) {
          const s = await sucursalesRepo.getAll();
          setSucursales(s.map(x => ({ value: String(x.idSucursal), label: x.nombreSucursal })));
        }
        if (columns.includes('idRol') || columns.includes('nombreRol')) {
          const r = await rolesRepo.getAll();
          setRoles(r.map(x => ({ value: String(x.idRol), label: x.nombreRol })));
        }
        if (columns.includes('idCargo') || columns.includes('nombreCargoRRHH')) {
          const c = await cargosRepo.getAll();
          setCargos(c.map(x => ({ value: String(x.idCargoRRHH), label: x.nombreCargoRRHH })));
        }
        if (columns.includes('idProveedor') || columns.includes('razonSocialProveedor')) {
          const p = await proveedoresRepo.getAll();
          setProveedores(p.map(x => ({ value: String(x.idProveedor), label: x.razonSocialProveedor })));
        }
        if (columns.includes('idListaPrecios') || columns.includes('nombreListaPrecios')) {
          const lp = await listaPreciosRepo.getAll();
          setListasPrecios(lp.map(x => ({ value: String(x.idListaPrecios), label: x.nombreListaPrecios })));
        }
        if (columns.includes('idEmpleado') || columns.includes('nombresEmpleado')) {
          const e = await empleadosRepo.getAll();
          setEmpleados(e.map(x => ({ value: String(x.idEmpleado), label: `${x.nombresEmpleado} ${x.apellidosEmpleado}` })));
        }
        if (columns.includes('idVehiculo') || columns.includes('placaVehiculo')) {
          const v = await vehiculosRepo.getAll();
          setVehiculos(v.map(x => ({ value: String(x.idVehiculo), label: x.placaVehiculo })));
        }
        if (columns.includes('idTransportista') || columns.includes('nombreTransportista')) {
          const t = await transportistasRepo.getAll();
          setTransportistas(t.map(x => ({ value: String(x.idTransportista), label: `${x.nombreTransportista} ${x.apellidosTransportista}` })));
        }
        if (columns.includes('idCentroTrabajo') || columns.includes('nombreCentroTrabajo')) {
          const ct = await centrosTrabajoRepo.getAll();
          setCentrosTrabajo(ct.map(x => ({ value: String(x.idCentroTrabajo), label: x.nombreCentroTrabajo })));
        }
        if (columns.includes('idListaMateriales') || columns.includes('nombreListaMateriales')) {
          const lm = await bomRepo.getAll();
          setListasMateriales(lm.map(x => ({ value: String(x.idListaMateriales), label: x.nombreListaMateriales })));
        }
        if (columns.includes('idEmpresa') || columns.includes('nombreEmpresa')) {
          const emp = await empresasRepo.getAll();
          setEmpresas(emp.map(x => ({ value: String(x.idEmpresa), label: x.nombreEmpresa })));
        }
      } catch (error) {
        console.error('Error loading select options:', error);
      }
    };
    loadOptions();
  }, [columns]);

  const setField = (k: string, v: string) => setFormData(f => ({ ...f, [k]: v }));

  // Convert form data to appropriate types before sending to backend
  // Fields shown by name in the table but sent as ID to the backend
  const nameToIdField: Record<string, string> = {
    nombreEmpresa: "idEmpresa",
  };

  const convertFormData = (data: Record<string, string>): Partial<T> => {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (nameToIdField[key]) {
        converted[nameToIdField[key]] = value === "" ? null : Number(value);
        continue;
      }
      // Convert numeric fields
      if (key.toLowerCase().includes('precio') ||
          key.toLowerCase().includes('total') ||
          key.toLowerCase().includes('cantidad') ||
          key.toLowerCase().includes('stock') ||
          key.toLowerCase().includes('rango') ||
          key.toLowerCase().includes('capacidad') ||
          key.toLowerCase().includes('salario') ||
          key.toLowerCase().includes('bonificacion') ||
          key.toLowerCase().includes('descuento') ||
          key.toLowerCase().includes('neto') ||
          key.toLowerCase().includes('bruto') ||
          key.toLowerCase().includes('horas')) {
        converted[key] = value === '' ? null : Number(value);
      }
      // Convert boolean fields (if any)
      else if (key.toLowerCase().includes('maneja') || key.toLowerCase().includes('estado')) {
        if (key.toLowerCase().includes('estado')) {
          converted[key] = value; // Keep as string for status fields
        } else {
          converted[key] = value === 'true' || value === '1';
        }
      }
      // Keep as string for everything else
      else {
        converted[key] = value;
      }
    }
    return converted as Partial<T>;
  };

  const handleCreate = async () => {
    const convertedData = convertFormData(formData);
    const ok = await crud.create(convertedData);
    if (ok) { showToast(`${title} creado`); editModal.close(); setFormData({}); }
    else showToast(crud.error ?? "Error", "error");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const convertedData = convertFormData(formData);
    const ok = await crud.update(selected[pk], convertedData);
    if (ok) { showToast("Actualizado"); editModal.close(); }
    else showToast(crud.error ?? "Error", "error");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await crud.remove(deleteId);
    if (ok) showToast("Eliminado"); else showToast(crud.error ?? "Error", "error");
    deleteModal.close();
  };

  const openCreate = () => { setSelected(null); setFormData({}); editModal.open(); };
  const openEdit   = (row: T) => {
    setSelected(row);
    const fd: Record<string,string> = {};
    columns.forEach(c => { fd[c] = String(row[c] ?? ""); });
    setFormData(fd);
    editModal.open();
  };

  const colLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

  // Determine if field should use Select and get options
  const getFieldConfig = (fieldName: string) => {
    const statusOptions: Record<string, Array<{value: string, label: string}>> = {
      estadoNomina: [
        { value: "A", label: "Activo" },
        { value: "I", label: "Inactivo" },
        { value: "C", label: "Cancelado" },
      ],
      estadoOrdenVenta: [
        { value: "P", label: "Pendiente" },
        { value: "A", label: "Aprobada" },
        { value: "D", label: "Despachada" },
        { value: "F", label: "Finalizada" },
        { value: "C", label: "Cancelada" },
      ],
      estadoOrdenCompra: [
        { value: "P", label: "Pendiente" },
        { value: "A", label: "Aprobada" },
        { value: "R", label: "Rechazada" },
        { value: "C", label: "Cancelada" },
      ],
      estadoOrdenDespachado: [
        { value: "P", label: "Pendiente" },
        { value: "D", label: "Despachado" },
        { value: "E", label: "En ruta" },
        { value: "C", label: "Cancelado" },
      ],
      estadoSalidaMercaderia: [
        { value: "P", label: "Pendiente" },
        { value: "A", label: "Aprobado" },
        { value: "C", label: "Cancelado" },
      ],
      estadoVacacion: [
        { value: "P", label: "Pendiente" },
        { value: "A", label: "Aprobada" },
        { value: "I", label: "Inactiva" },
      ],
      estadoOrdenProduccion: [
        { value: "P", label: "Pendiente" },
        { value: "E", label: "En proceso" },
        { value: "C", label: "Completado" },
        { value: "R", label: "Rechazado" },
      ],
      estadoSolicitud: [
        { value: "P", label: "Pendiente" },
        { value: "A", label: "Aprobada" },
        { value: "R", label: "Rechazada" },
        { value: "C", label: "Cancelada" },
      ],
      defaultEstado: [
        { value: "A", label: "Activo" },
        { value: "I", label: "Inactivo" },
      ],
    };

    const selectConfigs: Record<string, Array<{value: string, label: string}>> = {
      idSucursal: sucursales,
      nombreSucursal: sucursales,
      idRol: roles,
      nombreRol: roles,
      idCargo: cargos,
      nombreCargoRRHH: cargos,
      idProveedor: proveedores,
      razonSocialProveedor: proveedores,
      idListaPrecios: listasPrecios,
      nombreListaPrecios: listasPrecios,
      idEmpleado: empleados,
      nombresEmpleado: empleados,
      idVehiculo: vehiculos,
      placaVehiculo: vehiculos,
      idTransportista: transportistas,
      nombreTransportista: transportistas,
      idCentroTrabajo: centrosTrabajo,
      nombreCentroTrabajo: centrosTrabajo,
      idListaMateriales: listasMateriales,
      nombreListaMateriales: listasMateriales,
      idEmpresa: empresas,
      nombreEmpresa: empresas,
    };

    if (selectConfigs[fieldName]) return selectConfigs[fieldName];
    if (fieldName.toLowerCase().includes("estado")) {
      return statusOptions[fieldName] ?? statusOptions.defaultEstado;
    }
    return null;
  };

  const cellValue = (row: T, col: string) => {
    const v = row[col];
    if (v === null || v === undefined) return "—";
    if (col.toLowerCase().includes("estado")) return <StatusBadge status={String(v)} />;
    if (col.toLowerCase().includes("total") || col.toLowerCase().includes("neto") || col.toLowerCase().includes("precio"))
      return formatQTZ(Number(v));
    if (col.toLowerCase().includes("fecha")) return formatDate(String(v));
    return String(v);
  };

  return (
    <div className="fadeUp">
      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input
          value={crud.search} onChange={e => crud.setSearch(e.target.value)}
          placeholder="Buscar..."
          style={{
            flex:1, minWidth:160, padding:"8px 12px",
            background:"var(--bg3)", border:"1px solid var(--sand)",
            borderRadius:"var(--radius)", fontSize:13, outline:"none",
          }}
        />
        <Button onClick={openCreate}>+ Nuevo</Button>
      </div>

      {/* Error */}
      {crud.error && <p style={{ fontSize:12, color:"var(--danger)", marginBottom:12 }}>{crud.error}</p>}

      {/* Table */}
      {crud.loading ? <Spinner /> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"var(--bg2)", borderBottom:"2px solid var(--sand)" }}>
                {columns.map(c => (
                  <th key={c} style={{ padding:"9px 12px", textAlign:"left", fontWeight:600, fontSize:10,
                    letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--txtMuted)", whiteSpace:"nowrap" }}>
                    {colLabel(c)}
                  </th>
                ))}
                <th style={{ padding:"9px 12px", textAlign:"right", fontWeight:600, fontSize:10,
                  letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--txtMuted)" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} style={{ textAlign:"center", padding:40, color:"var(--txtMuted)", fontSize:13 }}>
                  Sin registros
                </td></tr>
              ) : crud.rows.map((row, idx) => (
                <tr key={row[pk] ?? idx} style={{
                  borderBottom:"1px solid var(--sand)",
                  background: idx % 2 === 0 ? "var(--bg3)" : "var(--bg2)",
                }}>
                  {columns.map(c => (
                    <td key={c} style={{ padding:"9px 12px", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {cellValue(row, c)}
                    </td>
                  ))}
                  <td style={{ padding:"9px 12px", textAlign:"right", whiteSpace:"nowrap" }}>
                    <button onClick={() => openEdit(row)} style={{
                      background:"none", border:"1px solid var(--sand)", borderRadius:"var(--radius)",
                      padding:"3px 10px", fontSize:11, cursor:"pointer", marginRight:6,
                      color:"var(--txtMid)",
                    }}>Editar</button>
                    <button onClick={() => { setDeleteId(row[pk]); deleteModal.open(); }} style={{
                      background:"none", border:"1px solid rgba(184,50,50,0.3)", borderRadius:"var(--radius)",
                      padding:"3px 10px", fontSize:11, cursor:"pointer",
                      color:"var(--danger)",
                    }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {crud.totalPages > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
          <Button variant="ghost" size="sm" onClick={() => crud.setPage(p => Math.max(0, p-1))} disabled={crud.page === 0}>←</Button>
          <span style={{ padding:"5px 12px", fontSize:12, color:"var(--txtMuted)" }}>
            {crud.page + 1} / {crud.totalPages}
          </span>
          <Button variant="ghost" size="sm" onClick={() => crud.setPage(p => Math.min(crud.totalPages-1, p+1))} disabled={crud.page >= crud.totalPages-1}>→</Button>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close}
        title={selected ? `Editar ${title}` : `Nuevo ${title}`} width={500}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {columns.filter(c => !c.toLowerCase().includes("nombre") || !selected).map(c => {
            const options = getFieldConfig(c);
            const isNumeric = c.toLowerCase().includes('precio') ||
                             c.toLowerCase().includes('total') ||
                             c.toLowerCase().includes('cantidad') ||
                             c.toLowerCase().includes('stock') ||
                             c.toLowerCase().includes('rango') ||
                             c.toLowerCase().includes('capacidad') ||
                             c.toLowerCase().includes('salario') ||
                             c.toLowerCase().includes('bonificacion') ||
                             c.toLowerCase().includes('descuento') ||
                             c.toLowerCase().includes('neto') ||
                             c.toLowerCase().includes('bruto') ||
                             c.toLowerCase().includes('horas');
            return (
              <div key={c} style={{ gridColumn: c.length > 20 ? "1/-1" : undefined }}>
                {options ? (
                  <Select
                    label={colLabel(c)}
                    value={formData[c] ?? ""}
                    onChange={v => setField(c, v)}
                    options={options}
                    placeholder={`Seleccionar ${colLabel(c).toLowerCase()}`}
                  />
                ) : (
                  <Input
                    label={colLabel(c)}
                    value={formData[c] ?? ""}
                    onChange={v => setField(c, v)}
                    type={isNumeric ? "number" : "text"}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
          <Button variant="ghost" onClick={editModal.close}>Cancelar</Button>
          <Button loading={crud.saving} onClick={selected ? handleUpdate : handleCreate}>
            {selected ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete}
        title="Eliminar registro"
        message="¿Está seguro? Esta acción no se puede deshacer."
      />
    </div>
  );
}
