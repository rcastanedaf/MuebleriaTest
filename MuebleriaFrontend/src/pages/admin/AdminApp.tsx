// src/pages/admin/AdminApp.tsx
import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../core/api/apiClient";
import { Button, Badge, StatusBadge, Spinner, Modal, Input, Select, ConfirmDialog, Toast } from "../../shared/components";
import { DashboardWidget, DashboardTableWidget, SimpleLineChart } from "../../shared/components/DashboardWidget";
import { apiClient } from "../../core/api/apiClient";
import { useCrud } from "../../features/admin/hooks/useCrud";
import { useDisclosure } from "../../shared/hooks";
import { formatQTZ, formatDate } from "../../shared/utils";
import { dashboardRepository } from "../../features/admin/data/dashboardRepository";
import {
  empleadosRepo, articulosRepo, proveedoresRepo, clientesRepo,
  ordenesVentaRepo, ordenesCompraRepo, vehiculosRepo, transportistasRepo,
  despachosRepo, ordenesProducRepo, nominaRepo, usuariosRepo,
  bodegasRepo, sucursalesRepo, rolesRepo, cargosRepo, listaPreciosRepo,
  centrosTrabajoRepo, bomRepo, empresasRepo,
} from "../../features/admin/data/adminRepository";
import { PermisosMatrix } from "./PermisosMatrix";

interface Props {
  showToast: (msg: string, type?: "success"|"error") => void;
  allowedModules: string[] | null; // null = sin restricción
  onLogout: () => void;
}

type Module =
  | "dashboard" | "empleados" | "nomina"
  | "articulos" | "bodegas"
  | "proveedores" | "ordenesCompra"
  | "clientes" | "ordenesVenta"
  | "produccion"
  | "vehiculos" | "despachos"
  | "usuarios" | "sucursales" | "roles" | "permisos"
  | "reportes";

const MODULES: Array<{ key: Module; label: string; icon: string; group: string }> = [
  { key:"dashboard",    label:"Dashboard",      icon:"📊", group:"General" },
  { key:"sucursales",   label:"Sucursales",     icon:"🏢", group:"Config" },
  { key:"roles",        label:"Roles",          icon:"🔐", group:"Config" },
  { key:"usuarios",     label:"Usuarios",       icon:"👥", group:"Config" },
  { key:"permisos",     label:"Permisos",       icon:"🛡️", group:"Config" },
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
  { key:"reportes",     label:"Reportes",       icon:"📈", group:"Reportes" },
];

export function AdminApp({ showToast, allowedModules, onLogout }: Props) {
  const [active, setActive] = useState<Module>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  const visibleModules = allowedModules === null
    ? MODULES
    : MODULES.filter(m => m.key === "dashboard" || allowedModules.includes(m.key));

  const groups = [...new Set(visibleModules.map(m => m.group))];

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
            {visibleModules.filter(m => m.group === group).map(m => (
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
          <h1 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:400, flex:1 }}>
            {MODULES.find(m => m.key === active)?.label ?? "Dashboard"}
          </h1>
          <button onClick={onLogout} style={{
            background:"none", border:"1px solid var(--sand)", borderRadius:"var(--radius)",
            padding:"6px 12px", cursor:"pointer", fontSize:12, color:"var(--txtMuted)",
          }}>Cerrar sesión</button>
        </header>

        <main style={{ padding:"20px 16px" }}>
          {active === "dashboard" && <Dashboard />}
          {active === "empleados"   && <CrudTable repo={empleadosRepo}    pk="idEmpleado"    title="Empleados"      columns={["numeroEmpleado","nombresEmpleado","apellidosEmpleado","nombreCargoRRHH","estadoEmpleado"]} showToast={showToast} />}
          {active === "nomina"      && <CrudTable repo={nominaRepo}        pk="idNomina"       title="Nómina"         columns={["periodoNomina","fechaPagoNomina","totalNetoNomina","estadoNomina","nombreSucursal"]} showToast={showToast} />}
          {active === "articulos"   && <ArticulosModule showToast={showToast} />}
          {active === "bodegas"     && <CrudTable repo={bodegasRepo}       pk="idBodega"      title="Bodegas"        columns={["codigoBodega","nombreBodega","tipoBodega","estadoBodega","nombreSucursal"]} showToast={showToast} />}
          {active === "proveedores" && <CrudTable repo={proveedoresRepo}   pk="idProveedor"   title="Proveedores"    columns={["codigoProveedor","razonSocialProveedor","nitProveedor","emailProveedor","estadoProveedor"]} showToast={showToast} />}
          {active === "ordenesCompra"&&<CrudTable repo={ordenesCompraRepo} pk="idOrdenCompra" title="Órdenes Compra" columns={["numeroOrdenCompra","fechaSolicitudOrdenCompra","razonSocialProveedor","totalOrdenCompra","estadoOrdenCompra"]} showToast={showToast} />}
          {active === "clientes"    && <CrudTable repo={clientesRepo}      pk="idCliente"     title="Clientes"       columns={["numeroDocumentoCliente","nombresCliente","emailCliente","ciudadCliente","tipoPersonaCliente","estadoCliente"]} showToast={showToast} />}
          {active === "ordenesVenta"&& <CrudTable repo={ordenesVentaRepo}  pk="idOrdenVenta"  title="Órdenes Venta"  columns={["numeroOrdenVenta","fechaSolicitudOrdenVenta","totalOrdenVenta","estadoOrdenVenta"]} showToast={showToast} />}
          {active === "produccion"  && <CrudTable repo={ordenesProducRepo} pk="idOrdenProduccion" title="Producción" columns={["codigoOrdenProduccion","nombreListaMateriales","cantidadPlanificadaOrdenProduccion","estadoOrdenProduccion"]} showToast={showToast} />}
          {active === "vehiculos"   && <CrudTable repo={vehiculosRepo}     pk="idVehiculo"    title="Vehículos"      columns={["placaVehiculo","marcaVehiculo","modeloVehiculo","tipoVehiculo","estadoVehiculo"]} showToast={showToast} />}
          {active === "despachos"   && <CrudTable repo={despachosRepo}     pk="idOrdenDespacho" title="Despachos"    columns={["nombreOrdenDespacho","fechaCreaOrdenDespacho","placaVehiculo","nombreTransportista","estadoOrdenDespachado"]} showToast={showToast} />}
          {active === "usuarios"    && <CrudTable repo={usuariosRepo}      pk="idUsuario"     title="Usuarios"       columns={["usernameUsuario","emailUsuario","passwordUsuario","nombreRol","nombreSucursal","estadoUsuario","ultimoAccesoUsuario"]} showToast={showToast} />}
          {active === "sucursales"  && <CrudTable repo={sucursalesRepo}    pk="idSucursal"    title="Sucursales"     columns={["codigoSucursal","nombreSucursal","emailSucursal","estadoSucursal","nombreEmpresa"]} showToast={showToast} />}
          {active === "roles"       && <CrudTable repo={rolesRepo}         pk="idRol"         title="Roles"          columns={["nombreRol","descripcionRol","rangoRol"]} showToast={showToast} />}
          {active === "permisos"    && <PermisosMatrix showToast={showToast} />}
          {active === "reportes"    && <ReportesModule />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  // Estadísticas principales
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Ventas
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [salesSummaryLoading, setSalesSummaryLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [salesByMonth, setSalesByMonth] = useState<any[]>([]);
  const [salesByMonthLoading, setSalesByMonthLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentSalesLoading, setRecentSalesLoading] = useState(true);

  // Administración
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<any>(null);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(true);
  const [newClients, setNewClients] = useState<any>(null);
  const [newClientsLoading, setNewClientsLoading] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState<any>(null);
  const [dispatchStatusLoading, setDispatchStatusLoading] = useState(true);
  const [inventoryByCategory, setInventoryByCategory] = useState<any[]>([]);
  const [inventoryByCategoryLoading, setInventoryByCategoryLoading] = useState(true);

  // Errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setStatsLoading(true);
        setSalesSummaryLoading(true);
        setTopProductsLoading(true);
        setSalesByMonthLoading(true);
        setRecentSalesLoading(true);
        setLowStockLoading(true);
        setInventoryByCategoryLoading(true);
        setPendingOrdersLoading(true);
        setNewClientsLoading(true);
        setDispatchStatusLoading(true);
        setErrors({});

        // Cargar datos en paralelo
        const [
          statsData,
          salesData,
          topProdsData,
          salesMonthData,
          recentSalesData,
          lowStockData,
          pendingOrdData,
          newClientsData,
          dispatchData,
          inventoryCatData,
        ] = await Promise.all([
          dashboardRepository.getStats().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, stats: "No se pudo cargar estadísticas" }));
            return null;
          }),
          dashboardRepository.getSalesSummary().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, sales: "No se pudo cargar resumen de ventas" }));
            return null;
          }),
          dashboardRepository.getTopProducts().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, topProducts: "No se pudo cargar productos" }));
            return [];
          }),
          dashboardRepository.getSalesByMonth().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, salesMonth: "No se pudo cargar gráfico" }));
            return [];
          }),
          dashboardRepository.getRecentSales(10).catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, recentSales: "No se pudo cargar órdenes recientes" }));
            return [];
          }),
          dashboardRepository.getLowStock().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, lowStock: "No se pudo cargar stock bajo" }));
            return [];
          }),
          dashboardRepository.getPendingOrders().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, pendingOrders: "No se pudo cargar órdenes pendientes" }));
            return null;
          }),
          dashboardRepository.getNewClients().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, newClients: "No se pudo cargar clientes nuevos" }));
            return null;
          }),
          dashboardRepository.getDispatchStatus().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, dispatch: "No se pudo cargar despachos" }));
            return null;
          }),
          dashboardRepository.getInventoryByCategory().catch((err: any) => {
            setErrors((e: Record<string, string>) => ({ ...e, inventory: "No se pudo cargar inventario" }));
            return [];
          }),
        ]);

        setStats(statsData);
        setSalesSummary(salesData);
        setTopProducts(topProdsData || []);
        setSalesByMonth(salesMonthData || []);
        setRecentSales(recentSalesData || []);
        setLowStock(lowStockData || []);
        setPendingOrders(pendingOrdData);
        setNewClients(newClientsData);
        setDispatchStatus(dispatchData);
        setInventoryByCategory(inventoryCatData || []);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setStatsLoading(false);
        setSalesSummaryLoading(false);
        setTopProductsLoading(false);
        setSalesByMonthLoading(false);
        setRecentSalesLoading(false);
        setLowStockLoading(false);
        setInventoryByCategoryLoading(false);
        setPendingOrdersLoading(false);
        setNewClientsLoading(false);
        setDispatchStatusLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="fadeUp">
      {/* ─── FILA 1: KPI Principales ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <DashboardWidget
          icon="🪑"
          title="Artículos activos"
          value={stats?.articulosActivos ?? "…"}
          color="var(--olive)"
          loading={statsLoading}
          size="medium"
          exportRows={stats ? [{ label: "Artículos activos", value: stats.articulosActivos }] : undefined}
          exportFilename="articulos_activos"
        />
        <DashboardWidget
          icon="🛒"
          title="Órdenes pendientes"
          value={stats?.ordenesPendientes ?? "…"}
          color="var(--gold)"
          loading={statsLoading}
          size="medium"
          exportRows={stats ? [{ label: "Órdenes pendientes", value: stats.ordenesPendientes }] : undefined}
          exportFilename="ordenes_pendientes"
        />
        <DashboardWidget
          icon="👤"
          title="Clientes activos"
          value={stats?.clientesActivos ?? "…"}
          color="#1e4fa0"
          loading={statsLoading}
          size="medium"
          exportRows={stats ? [{ label: "Clientes activos", value: stats.clientesActivos }] : undefined}
          exportFilename="clientes_activos"
        />
        <DashboardWidget
          icon="🚛"
          title="Despachos en ruta"
          value={stats?.despachosEnRuta ?? "…"}
          color="#2e6b4f"
          loading={statsLoading}
          size="medium"
          exportRows={stats ? [{ label: "Despachos en ruta", value: stats.despachosEnRuta }] : undefined}
          exportFilename="despachos_en_ruta"
        />
      </div>

      {/* ─── FILA 2: Resumen de Ventas ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <DashboardWidget
          icon="💰"
          title="Total de ventas (mes)"
          value={
            salesSummary?.totalVentas
              ? `$${Number(salesSummary.totalVentas).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`
              : "…"
          }
          subtitle={salesSummary ? `${salesSummary.totalOrdenes} órdenes` : ""}
          color="var(--gold)"
          loading={salesSummaryLoading}
          error={errors.sales}
          size="medium"
          exportRows={salesSummary ? [
            { label: "Total ventas", value: salesSummary.totalVentas },
            { label: "Total órdenes", value: salesSummary.totalOrdenes },
            { label: "Promedio venta", value: salesSummary.promedioVenta },
          ] : undefined}
          exportFilename="resumen_ventas_mes"
        />
        <DashboardWidget
          icon="✓"
          title="Órdenes completadas"
          value={salesSummary?.ordenesCompletadas ?? "…"}
          subtitle={salesSummary ? `De ${salesSummary.totalOrdenes} total` : ""}
          color="#2e6b4f"
          loading={salesSummaryLoading}
          error={errors.sales}
          size="medium"
          exportRows={salesSummary ? [
            { label: "Órdenes completadas", value: salesSummary.ordenesCompletadas },
            { label: "Total órdenes", value: salesSummary.totalOrdenes },
          ] : undefined}
          exportFilename="ordenes_completadas"
        />
        <DashboardWidget
          icon="⏱"
          title="Órdenes en proceso"
          value={salesSummary?.ordenesEnProceso ?? "…"}
          subtitle={salesSummary ? `Promedio: $${Number(salesSummary.promedioVenta || 0).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : ""}
          color="#ff9500"
          loading={salesSummaryLoading}
          error={errors.sales}
          size="medium"
          exportRows={salesSummary ? [
            { label: "Órdenes en proceso", value: salesSummary.ordenesEnProceso },
            { label: "Promedio venta", value: salesSummary.promedioVenta },
          ] : undefined}
          exportFilename="ordenes_en_proceso"
        />
      </div>

      {/* ─── FILA 3: Gráfico de Ventas y Top Productos ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 24 }}>
        <SimpleLineChart
          title="Ingresos por mes"
          icon="📈"
          data={salesByMonth}
          loading={salesByMonthLoading}
          error={errors.salesMonth}
          color="var(--gold)"
          exportFilename="ingresos_por_mes"
        />

        <DashboardTableWidget
          icon="⭐"
          title="Top 5 Artículos vendidos"
          columns={[
            { key: "nombre", label: "Artículo" },
            { key: "cantidadVendida", label: "Cantidad" },
            { key: "totalVendido", label: "Total" },
          ]}
          data={topProducts.map((p: any) => ({
            nombre: p.nombre,
            cantidadVendida: p.cantidadVendida,
            totalVendido: `$${Number(p.totalVendido || 0).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`,
          }))}
          loading={topProductsLoading}
          error={errors.topProducts}
          color="var(--olive)"
          exportFilename="top_articulos_vendidos"
        />
      </div>

      {/* ─── FILA 4: Inventario y Stock ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 24 }}>
        <DashboardTableWidget
          icon="⚠"
          title="Stock bajo (10 primeros)"
          columns={[
            { key: "nombre", label: "Artículo" },
            { key: "stockActual", label: "Actual" },
            { key: "stockMinimo", label: "Mínimo" },
          ]}
          data={lowStock.slice(0, 10).map(item => ({
            nombre: item.nombre,
            stockActual: item.stockActual,
            stockMinimo: item.stockMinimo,
          }))}
          loading={lowStockLoading}
          error={errors.lowStock}
          color="#c41e3a"
          exportFilename="stock_bajo"
        />

        <DashboardTableWidget
          icon="📦"
          title="Inventario por categoría"
          columns={[
            { key: "categoria", label: "Categoría" },
            { key: "totalArticulos", label: "Artículos" },
            { key: "cantidadTotal", label: "Stock" },
          ]}
          data={inventoryByCategory.map(cat => ({
            categoria: cat.categoria || "Sin categoría",
            totalArticulos: cat.totalArticulos,
            cantidadTotal: cat.cantidadTotal,
          }))}
          loading={inventoryByCategoryLoading}
          error={errors.inventory}
          color="var(--olive)"
          exportFilename="inventario_por_categoria"
        />
      </div>

      {/* ─── FILA 5: Órdenes de Compra y Despachos ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <DashboardWidget
          icon="📋"
          title="Órdenes compra pendientes"
          value={pendingOrders?.totalPendientes ?? "…"}
          subtitle={pendingOrders ? `${pendingOrders.ordenesPendientes} P, ${pendingOrders.ordenesEnProceso} E` : ""}
          color="#1e4fa0"
          loading={pendingOrdersLoading}
          error={errors.pendingOrders}
          size="medium"
          exportRows={pendingOrders ? [
            { label: "Total pendientes", value: pendingOrders.totalPendientes },
            { label: "Órdenes pendientes", value: pendingOrders.ordenesPendientes },
            { label: "Órdenes en proceso", value: pendingOrders.ordenesEnProceso },
          ] : undefined}
          exportFilename="ordenes_compra_pendientes"
        />
        <DashboardWidget
          icon="👥"
          title="Clientes nuevos (mes)"
          value={newClients?.totalNuevos ?? "…"}
          subtitle={newClients ? `${newClients.clientesConCompras} con compras` : ""}
          color="#2e6b4f"
          loading={newClientsLoading}
          error={errors.newClients}
          size="medium"
          exportRows={newClients ? [
            { label: "Clientes nuevos", value: newClients.totalNuevos },
            { label: "Con compras", value: newClients.clientesConCompras },
          ] : undefined}
          exportFilename="clientes_nuevos_mes"
        />
        <DashboardWidget
          icon="🚚"
          title="Despachos programados"
          value={dispatchStatus?.totalDespachos ?? "…"}
          subtitle={dispatchStatus ? `E: ${dispatchStatus.enProgreso}` : ""}
          color="#ff9500"
          loading={dispatchStatusLoading}
          error={errors.dispatch}
          size="medium"
          exportRows={dispatchStatus ? [
            { label: "Total despachos", value: dispatchStatus.totalDespachos },
            { label: "Pendientes", value: dispatchStatus.pendientes },
            { label: "En progreso", value: dispatchStatus.enProgreso },
            { label: "Completados", value: dispatchStatus.completados },
          ] : undefined}
          exportFilename="despachos_programados"
        />
      </div>

      {/* ─── FILA 6: Últimas Órdenes de Venta ─── */}
      <div style={{ marginBottom: 24 }}>
        <DashboardTableWidget
          icon="📊"
          title="Últimas órdenes de venta"
          columns={[
            { key: "numero", label: "N° Orden" },
            { key: "cliente", label: "Cliente" },
            { key: "fecha", label: "Fecha" },
            { key: "total", label: "Total" },
            { key: "estado", label: "Estado" },
          ]}
          data={recentSales.map(sale => ({
            numero: sale.numero,
            cliente: sale.cliente || "N/A",
            fecha: sale.fecha ? new Date(sale.fecha).toLocaleDateString("es-ES") : "N/A",
            total: `$${Number(sale.total || 0).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`,
            estado: sale.estado,
          }))}
          loading={recentSalesLoading}
          error={errors.recentSales}
          color="var(--gold)"
          exportFilename="ultimas_ordenes_venta"
        />
      </div>

      {/* ─── INFORMACIÓN ADICIONAL ─── */}
      <div style={{ padding: "20px", background: "var(--bg3)", border: "1px solid var(--sand)", borderRadius: "var(--radiusLg)" }}>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 400, marginBottom: 8 }}>
          📊 Panel de Control ERP
        </p>
        <p style={{ fontSize: 13, color: "var(--txtMuted)", lineHeight: 1.7 }}>
          Panel administrativo de Muebles Los Alpes. Este dashboard muestra en tiempo real el estado de ventas, inventario,
          órdenes de compra y despachos. Selecciona un módulo en el menú lateral para gestionar empleados, inventario,
          compras, ventas, producción y transporte en detalle.
        </p>
      </div>
    </div>
  );
}

// ── Generic CRUD Table ────────────────────────────────────────
// ── ArticulosModule: CrudTable + subida de foto BLOB ─────────
function ArticulosModule({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const rowFileRef  = useRef<HTMLInputElement>(null);
  const formFileRef = useRef<HTMLInputElement>(null);
  const [uploadId, setUploadId]     = useState<number | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Shared upload logic
  const doUpload = async (id: number, file: File) => {
    setUploading(true);
    const token = localStorage.getItem("alpes_token");
    const form  = new FormData();
    form.append("foto", file);
    try {
      const res = await fetch(`${API_BASE_URL}/articulos/${id}/foto`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error("Error al subir");
      showToast("Foto guardada");
    } catch {
      showToast("Error al subir foto", "error");
    } finally {
      setUploading(false);
    }
  };

  // Row button handler (tabla)
  const handleRowFotoClick = (id: number) => {
    setUploadId(id);
    rowFileRef.current!.value = "";
    rowFileRef.current?.click();
  };
  const handleRowFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadId == null) return;
    await doUpload(uploadId, file);
    e.target.value = "";
  };

  // Form inline handler (modal de edición)
  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };
  const handleFormUpload = async (id: number) => {
    if (!pendingFile) return;
    await doUpload(id, pendingFile);
    setPendingFile(null);
    setPreview(null);
  };

  // Extra content rendered inside the edit modal
  const fotoFormContent = (row: any) => (
    <div style={{
      gridColumn: "1/-1",
      borderTop: "1px solid var(--sand)", paddingTop: 14, marginTop: 4,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--txtMuted)", marginBottom: 10,
        textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Foto del artículo
      </p>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Preview actual o pendiente */}
        <div style={{
          width: 90, height: 90, borderRadius: "var(--radius)", overflow: "hidden",
          border: "1px solid var(--sand)", flexShrink: 0,
          background: "linear-gradient(135deg,#e8dcc8,#d4c5a9)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {preview ? (
            <img src={preview} alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : row?.tieneFoto ? (
            <img src={`${API_BASE_URL}/articulos/${row.idArticulo}/foto`} alt="foto actual"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 28, opacity: 0.5 }}>🪑</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <input
            ref={formFileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFormFileChange}
          />
          <Button size="sm" variant="ghost"
            onClick={() => { formFileRef.current!.value = ""; formFileRef.current?.click(); }}>
            {preview ? "Cambiar imagen" : row?.tieneFoto ? "Reemplazar foto" : "Adjuntar foto"}
          </Button>
          {pendingFile && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, color: "var(--txtMuted)", marginBottom: 6 }}>
                {pendingFile.name} ({(pendingFile.size / 1024).toFixed(0)} KB)
              </p>
              <Button size="sm" loading={uploading}
                onClick={() => handleFormUpload(row.idArticulo)}>
                Subir foto
              </Button>
            </div>
          )}
          {!pendingFile && (
            <p style={{ fontSize: 11, color: "var(--txtMuted)", marginTop: 6 }}>
              {row?.tieneFoto ? "Ya tiene foto guardada." : "Sin foto aún."}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Input oculto para el botón de fila */}
      <input ref={rowFileRef} type="file" accept="image/*"
        style={{ display:"none" }} onChange={handleRowFileChange} />

      <CrudTable
        repo={articulosRepo}
        pk="idArticulo"
        title="Artículos"
        columns={["codigoArticulo","nombreArticulo","tipoArticulo","materialArticulo","colorArticulo","precio","stockDisponible","estadoArticulo","tieneFoto"]}
        formFields={[
          "codigoArticulo","codigoBarraArticulo",
          "nombreArticulo","descripcionArticulo",
          "tipoArticulo","estadoArticulo",
          "materialArticulo","colorArticulo",
          "pesoArticulo","stockMinimo","stockMaximo","stockDisponible","precio",
          "altoArticulo","anchoArticulo","profundidadArticulo",
        ]}
        fieldLabels={{
          codigoArticulo:      "Código",
          codigoBarraArticulo: "Código barra",
          nombreArticulo:      "Nombre",
          descripcionArticulo: "Descripción",
          tipoArticulo:        "Tipo",
          estadoArticulo:      "Estado",
          materialArticulo:    "Material",
          colorArticulo:       "Color",
          pesoArticulo:        "Peso (g)",
          stockMinimo:         "Stock mínimo",
          stockMaximo:         "Stock máximo",
          stockDisponible:     "Stock disponible",
          precio:              "Precio",
          altoArticulo:        "Alto (cm)",
          anchoArticulo:       "Ancho (cm)",
          profundidadArticulo: "Profundidad (cm)",
        }}
        showToast={showToast}
        onEditModalClose={() => { setPreview(null); setPendingFile(null); }}
        extraFormContent={fotoFormContent}
        extraRowAction={(row: any) => (
          <button
            onClick={() => handleRowFotoClick(row.idArticulo)}
            disabled={uploading}
            title="Subir / cambiar foto"
            style={{
              background:"none", border:"1px solid var(--sand)", borderRadius:"var(--radius)",
              padding:"3px 8px", fontSize:13, cursor:"pointer", marginRight:6,
            }}
          >📷</button>
        )}
      />
    </>
  );
}

function CrudTable<T extends Record<string,any>>({
  repo, pk, title, columns, formFields, fieldLabels, showToast, extraRowAction,
  extraFormContent, onEditModalClose, onSave,
}: {
  repo: any; pk: string; title: string; columns: string[];
  formFields?: string[];
  fieldLabels?: Record<string, string>;
  showToast: (m: string, t?: "success"|"error") => void;
  extraRowAction?: (row: T) => React.ReactNode;
  extraFormContent?: (row: T | null) => React.ReactNode;
  onEditModalClose?: () => void;
  onSave?: (result: T | null, data: Partial<T>, action: "create"|"update") => Promise<void> | void;
}) {
  const fields = formFields ?? columns;
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
      const allFields = [...columns, ...(formFields ?? [])];
      try {
        if (allFields.includes('idSucursal') || allFields.includes('nombreSucursal')) {
          const s = await sucursalesRepo.getAll();
          setSucursales(s.map(x => ({ value: String(x.idSucursal), label: x.nombreSucursal })));
        }
        if (allFields.includes('idRol') || allFields.includes('nombreRol')) {
          const r = await rolesRepo.getAll();
          setRoles(r.map(x => ({ value: String(x.idRol), label: x.nombreRol })));
        }
        if (allFields.includes('idCargo') || allFields.includes('nombreCargoRRHH')) {
          const c = await cargosRepo.getAll();
          setCargos(c.map(x => ({ value: String(x.idCargoRRHH), label: x.nombreCargoRRHH })));
        }
        if (allFields.includes('idProveedor') || allFields.includes('razonSocialProveedor')) {
          const p = await proveedoresRepo.getAll();
          setProveedores(p.map(x => ({ value: String(x.idProveedor), label: x.razonSocialProveedor })));
        }
        if (allFields.includes('idListaPrecios') || allFields.includes('nombreListaPrecios')) {
          const lp = await listaPreciosRepo.getAll();
          setListasPrecios(lp.map(x => ({ value: String(x.idListaPrecios), label: x.nombreListaPrecios })));
        }
        if (allFields.includes('idEmpleado') || allFields.includes('nombresEmpleado')) {
          const e = await empleadosRepo.getAll();
          setEmpleados(e.map(x => ({ value: String(x.idEmpleado), label: `${x.nombresEmpleado} ${x.apellidosEmpleado}` })));
        }
        if (allFields.includes('idVehiculo') || allFields.includes('placaVehiculo')) {
          const v = await vehiculosRepo.getAll();
          setVehiculos(v.map(x => ({ value: String(x.idVehiculo), label: x.placaVehiculo })));
        }
        if (allFields.includes('idTransportista') || allFields.includes('nombreTransportista')) {
          const t = await transportistasRepo.getAll();
          setTransportistas(t.map(x => ({ value: String(x.idTransportista), label: `${x.nombreTransportista} ${x.apellidosTransportista}` })));
        }
        if (allFields.includes('idCentroTrabajo') || allFields.includes('nombreCentroTrabajo')) {
          const ct = await centrosTrabajoRepo.getAll();
          setCentrosTrabajo(ct.map(x => ({ value: String(x.idCentroTrabajo), label: x.nombreCentroTrabajo })));
        }
        if (allFields.includes('idListaMateriales') || allFields.includes('nombreListaMateriales')) {
          const lm = await bomRepo.getAll();
          setListasMateriales(lm.map(x => ({ value: String(x.idListaMateriales), label: x.nombreListaMateriales })));
        }
        if (allFields.includes('idEmpresa') || allFields.includes('nombreEmpresa')) {
          const emp = await empresasRepo.getAll();
          setEmpresas(emp.map(x => ({ value: String(x.idEmpresa), label: x.nombreEmpresa })));
        }
      } catch (error) {
        console.error('Error loading select options:', error);
      }
    };
    loadOptions();
  }, [columns, formFields]); // eslint-disable-line

  const setField = (k: string, v: string) => setFormData(f => ({ ...f, [k]: v }));

  const toSnakeKey = (key: string) => key.replace(/([A-Z])/g, "_$1").toLowerCase();
  const getRowValue = (row: T, col: string) => {
    const direct = row[col] ?? (row as any)[toSnakeKey(col)];
    if (direct !== undefined) return direct;
    if (col === "stockDisponible") {
      return (row as any).cantidadDiponibleStockArticulo ?? (row as any).stock_disponible;
    }
    if (col === "precio") {
      return (row as any).precioListaPreciosDet ?? (row as any).precio_unitario ?? (row as any).precio;
    }
    return (row as any)[col];
  };

  // Convert form data to appropriate types before sending to backend
  // Fields shown by name in the table but sent as ID to the backend
  const nameToIdField: Record<string, string> = {
    nombreEmpresa: "idEmpresa",
    nombreRol: "idRol",
    nombreSucursal: "idSucursal",
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
          key.toLowerCase().includes('horas') ||
          key.toLowerCase().includes('peso') ||
          key.toLowerCase().includes('alto') ||
          key.toLowerCase().includes('ancho') ||
          key.toLowerCase().includes('profundidad')) {
        converted[key] = value === '' ? null : Number(value);
      }
      // Keep as string for estado and maneja fields
      else if (key.toLowerCase().includes('estado') || key.toLowerCase().includes('maneja')) {
        converted[key] = value;
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
    const created = await crud.create(convertedData);
    if (created) {
      await onSave?.(created, convertedData, "create");
      showToast(`${title} creado`);
      closeModal();
      setFormData({});
    } else {
      showToast(crud.error ?? "Error", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const convertedData = convertFormData(formData);
    const ok = await crud.update(selected[pk], convertedData);
    if (ok) {
      const updatedRow = { ...selected, ...convertedData } as T;
      await onSave?.(updatedRow, convertedData, "update");
      showToast("Actualizado");
      closeModal();
    } else {
      showToast(crud.error ?? "Error", "error");
    }
  };

  const closeModal = () => { editModal.close(); onEditModalClose?.(); };

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
    fields.forEach(c => { fd[c] = String(getRowValue(row, c) ?? ""); });
    setFormData(fd);
    editModal.open();
  };

  const colLabel = (key: string) =>
    fieldLabels?.[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

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
      // Artículos
      tipoArticulo:         [{ value:"Interior", label:"Interior" }, { value:"Exterior", label:"Exterior" }],
      manejaLoteArticulo:   [{ value:"S", label:"Sí" }, { value:"N", label:"No" }],
      manejaSerieArticulo:  [{ value:"S", label:"Sí" }, { value:"N", label:"No" }],
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
    const v = getRowValue(row, col);
    if (col === "tieneFoto") return v ? "📷" : "—";
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
                    {extraRowAction && extraRowAction(row)}
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
      <Modal isOpen={editModal.isOpen} onClose={closeModal}
        title={selected ? `Editar ${title}` : `Nuevo ${title}`} width={520}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {fields.filter(c => c !== "tieneFoto" && (!c.toLowerCase().includes("nombre") || !selected)).map(c => {
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
                             c.toLowerCase().includes('horas') ||
                             c.toLowerCase().includes('peso') ||
                             c.toLowerCase().includes('alto') ||
                             c.toLowerCase().includes('ancho') ||
                             c.toLowerCase().includes('profundidad');
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
                    type={isNumeric ? "number" : c.toLowerCase().includes("password") ? "password" : "text"}
                    placeholder={c.toLowerCase().includes("password") && selected ? "Dejar vacío para no cambiar" : undefined}
                  />
                )}
              </div>
            );
          })}
          {/* Extra content (ej: foto) — solo en modo edición */}
          {extraFormContent && selected && extraFormContent(selected)}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
          <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
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

// ── Reportes Module ───────────────────────────────────────────
type ReporteTab =
  | "ventasDiarias" | "productoMasVendido" | "comprasCliente" | "cierreCaja"
  | "mktLtv" | "mktActividad" | "mktRetencion" | "mktCohorte" | "mktRemarketing";

function ReportesModule() {
  const [tab, setTab] = useState<ReporteTab>("ventasDiarias");

  const tabs: Array<{ key: ReporteTab; label: string; icon: string; group: string }> = [
    { key: "ventasDiarias",       label: "Ventas Diarias",       icon: "📅", group: "Operacionales" },
    { key: "productoMasVendido",  label: "Producto Más Vendido", icon: "⭐", group: "Operacionales" },
    { key: "comprasCliente",      label: "Compras por Cliente",  icon: "🤝", group: "Operacionales" },
    { key: "cierreCaja",          label: "Cierre de Caja",       icon: "💰", group: "Operacionales" },
    { key: "mktLtv",              label: "LTV Cliente",          icon: "💎", group: "Marketing" },
    { key: "mktActividad",        label: "Actividad",            icon: "📈", group: "Marketing" },
    { key: "mktRetencion",        label: "Retención",            icon: "🔄", group: "Marketing" },
    { key: "mktCohorte",          label: "Cohorte",              icon: "🗓️",  group: "Marketing" },
    { key: "mktRemarketing",      label: "Remarketing",          icon: "📣", group: "Marketing" },
  ];

  const groups = ["Operacionales", "Marketing"];

  return (
    <div className="fadeUp">
      {/* Tab bar */}
      {groups.map(g => (
        <div key={g} style={{ marginBottom: g === "Operacionales" ? 0 : 0 }}>
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
            color:"var(--txtMuted)", padding:"8px 0 4px", borderTop: g==="Marketing" ? "1px solid var(--sand)" : undefined }}>
            {g}
          </p>
          <div style={{ display:"flex", gap:2, flexWrap:"wrap", marginBottom:4 }}>
            {tabs.filter(t => t.group === g).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background:"none", border:"none", cursor:"pointer", padding:"7px 12px",
                fontSize:12, fontWeight: tab===t.key ? 600 : 400,
                color: tab===t.key ? "var(--dark)" : "var(--txtMuted)",
                borderBottom: tab===t.key ? "2px solid var(--gold)" : "2px solid transparent",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ borderBottom:"1px solid var(--sand)", marginBottom:20 }} />

      {tab === "ventasDiarias"      && <RptVentasDiarias />}
      {tab === "productoMasVendido" && <RptProductoMasVendido />}
      {tab === "comprasCliente"     && <RptComprasCliente />}
      {tab === "cierreCaja"         && <RptCierreCaja />}
      {tab === "mktLtv"             && <RptMktLtv />}
      {tab === "mktActividad"       && <RptMktActividad />}
      {tab === "mktRetencion"       && <RptMktRetencion />}
      {tab === "mktCohorte"         && <RptMktCohorte />}
      {tab === "mktRemarketing"     && <RptMktRemarketing />}
    </div>
  );
}

// ── Reporte: Ventas Diarias ───────────────────────────────────
function RptVentasDiarias() {
  const today = new Date().toISOString().slice(0, 10);
  const [fi, setFi] = useState(today);
  const [ff, setFf] = useState(today);
  const [ciudad, setCiudad] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (fi) params.set("fechaInicio", fi);
      if (ff) params.set("fechaFin", ff);
      if (ciudad.trim()) params.set("ciudad", ciudad.trim());
      const res = await apiClient.get<any>(`/reportes/ventas-diarias?${params}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error al cargar reporte"); }
    finally { setLoading(false); }
  };

  const thStyle: React.CSSProperties = { padding:"8px 10px", textAlign:"left", fontSize:10,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--txtMuted)",
    borderBottom:"2px solid var(--sand)", whiteSpace:"nowrap" };
  const tdStyle: React.CSSProperties = { padding:"8px 10px", fontSize:12, borderBottom:"1px solid var(--sand)" };

  const renderTable = (rows: any[], label: string) => rows.length === 0 ? null : (
    <div style={{ marginBottom:24 }}>
      <p style={{ fontFamily:"Cormorant Garamond, serif", fontSize:16, marginBottom:8 }}>{label}</p>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:"var(--bg2)" }}>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Artículo</th>
              <th style={thStyle}>Ciudad</th>
              <th style={thStyle}>Cantidad</th>
              <th style={{ ...thStyle, textAlign:"right" }}>Costo Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                <td style={tdStyle}>{r.fechaVenta ?? r.fecha_venta ?? "—"}</td>
                <td style={tdStyle}>{r.tipoMueble ?? r.tipo_mueble ?? "—"}</td>
                <td style={tdStyle}>{r.nombreArticulo ?? r.nombre_articulo ?? "—"}</td>
                <td style={tdStyle}>{r.ciudad ?? "—"}</td>
                <td style={tdStyle}>{r.cantidadVendida ?? r.cantidad_vendida ?? "—"}</td>
                <td style={{ ...tdStyle, textAlign:"right" }}>{formatQTZ(Number(r.costoTotal ?? r.costo_total ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha inicio</label>
          <input type="date" value={fi} onChange={e => setFi(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha fin</label>
          <input type="date" value={ff} onChange={e => setFf(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Ciudad (opcional)</label>
          <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Todas"
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)", width:140 }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>

      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}

      {data && (
        <div>
          <div style={{ display:"flex", gap:20, marginBottom:16, fontSize:12, color:"var(--txtMuted)" }}>
            <span>Generado: {data.fechaGeneracion}</span>
            <span>Ciudad: {data.ciudad}</span>
            <span style={{ marginLeft:"auto", fontWeight:700, color:"var(--dark)", fontSize:14 }}>
              Total General: {formatQTZ(Number(data.totalGeneral ?? 0))}
            </span>
          </div>
          {renderTable(data.interior ?? [], "Muebles de Interior")}
          {renderTable(data.exterior ?? [], "Muebles de Exterior")}
          {(data.interior?.length === 0 && data.exterior?.length === 0) && (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin registros para el período seleccionado.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte: Producto Más Vendido ─────────────────────────────
function RptProductoMasVendido() {
  const today = new Date().toISOString().slice(0, 10);
  const [fi, setFi] = useState(today.slice(0, 7) + "-01");
  const [ff, setFf] = useState(today);
  const [ciudad, setCiudad] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (fi) params.set("fechaInicio", fi);
      if (ff) params.set("fechaFin", ff);
      if (ciudad.trim()) params.set("ciudad", ciudad.trim());
      const res = await apiClient.get<any>(`/reportes/producto-mas-vendido?${params}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error al cargar reporte"); }
    finally { setLoading(false); }
  };

  const thStyle: React.CSSProperties = { padding:"8px 10px", textAlign:"left", fontSize:10,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--txtMuted)",
    borderBottom:"2px solid var(--sand)", whiteSpace:"nowrap" };
  const tdStyle: React.CSSProperties = { padding:"8px 10px", fontSize:12, borderBottom:"1px solid var(--sand)" };

  return (
    <div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha inicio</label>
          <input type="date" value={fi} onChange={e => setFi(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha fin</label>
          <input type="date" value={ff} onChange={e => setFf(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Ciudad (opcional)</label>
          <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Todas"
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)", width:140 }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>

      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}

      {data && (
        <div>
          <div style={{ display:"flex", gap:20, marginBottom:16, fontSize:12, color:"var(--txtMuted)" }}>
            <span>Generado: {data.fechaGeneracion}</span>
            <span>Ciudad: {data.ciudad}</span>
          </div>
          {(!data.resultados || data.resultados.length === 0) ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin registros para el período seleccionado.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:"var(--bg2)" }}>
                    <th style={{ ...thStyle, textAlign:"center" }}>#</th>
                    <th style={thStyle}>Ciudad</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Código</th>
                    <th style={thStyle}>Artículo</th>
                    <th style={{ ...thStyle, textAlign:"right" }}>Total Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.resultados.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color: i===0?"var(--gold)":undefined }}>
                        {i===0 ? "🥇" : i===1 ? "🥈" : i===2 ? "🥉" : i+1}
                      </td>
                      <td style={tdStyle}>{r.ciudad ?? "—"}</td>
                      <td style={tdStyle}>{r.tipoMueble ?? r.tipo_mueble ?? "—"}</td>
                      <td style={tdStyle}><code style={{ fontSize:11 }}>{r.codigoArticulo ?? r.codigo_articulo ?? "—"}</code></td>
                      <td style={tdStyle}>{r.nombreArticulo ?? r.nombre_articulo ?? "—"}</td>
                      <td style={{ ...tdStyle, textAlign:"right", fontWeight:600 }}>{formatQTZ(Number(r.totalVendido ?? r.total_vendido ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte: Compras por Cliente ──────────────────────────────
function RptComprasCliente() {
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buscarClientes = async () => {
    if (!search.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await apiClient.get<any>(`/reportes/clientes-lista?search=${encodeURIComponent(search)}`);
      const rows = (res.data ?? res) as any[];
      setClientes(rows);
    } catch { setClientes([]); }
    finally { setLoadingSearch(false); }
  };

  const load = async () => {
    if (!clienteId) return;
    setLoading(true); setError("");
    try {
      const res = await apiClient.get<any>(`/reportes/compras-cliente/${clienteId}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error al cargar reporte"); }
    finally { setLoading(false); }
  };

  const thStyle: React.CSSProperties = { padding:"8px 10px", textAlign:"left", fontSize:10,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--txtMuted)",
    borderBottom:"2px solid var(--sand)", whiteSpace:"nowrap" };
  const tdStyle: React.CSSProperties = { padding:"8px 10px", fontSize:12, borderBottom:"1px solid var(--sand)" };

  return (
    <div>
      {/* Búsqueda de cliente */}
      <div style={{ background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radiusLg)", padding:16, marginBottom:20 }}>
        <p style={{ fontSize:12, fontWeight:600, marginBottom:10 }}>Buscar cliente</p>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscarClientes()}
            placeholder="Nombre, documento o email..."
            style={{ flex:1, padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"#fff" }} />
          <Button onClick={buscarClientes} loading={loadingSearch} size="sm">Buscar</Button>
        </div>
        {clientes.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:160, overflowY:"auto" }}>
            {clientes.map((c: any) => {
              const id = String(c.idCliente ?? c.id_cliente ?? "");
              const nombre = c.nombreCliente ?? c.nombre_cliente ?? c.razonSocialCliente ?? "—";
              const doc = c.numeroDocumentoCliente ?? c.numero_documento_cliente ?? "";
              return (
                <button key={id} onClick={() => { setClienteId(id); setClientes([]); setSearch(nombre); }}
                  style={{
                    textAlign:"left", padding:"6px 10px", borderRadius:"var(--radius)",
                    border: clienteId===id ? "1px solid var(--gold)" : "1px solid var(--sand)",
                    background: clienteId===id ? "rgba(180,145,60,0.08)" : "#fff",
                    cursor:"pointer", fontSize:12,
                  }}>
                  <strong>{nombre}</strong>{doc ? ` — ${doc}` : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <Button onClick={load} loading={loading} disabled={!clienteId}>Ver Reporte</Button>
      </div>

      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}

      {data && (
        <div>
          {/* Cabecera cliente */}
          <div style={{ background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radiusLg)", padding:16, marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div>
                <p style={{ fontFamily:"Cormorant Garamond, serif", fontSize:20 }}>{data.cliente?.nombreCliente ?? "—"}</p>
                <p style={{ fontSize:12, color:"var(--txtMuted)" }}>Doc: {data.cliente?.numeroDocumentoCliente ?? "—"} · {data.cliente?.emailCliente ?? ""}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:11, color:"var(--txtMuted)" }}>Total comprado</p>
                <p style={{ fontSize:22, fontWeight:700, color:"var(--gold)" }}>{formatQTZ(Number(data.totalComprado ?? 0))}</p>
              </div>
            </div>
          </div>

          {/* Órdenes */}
          {(!data.compras || data.compras.length === 0) ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Este cliente no tiene compras registradas.</p>
          ) : data.compras.map((orden: any, i: number) => (
            <div key={i} style={{ border:"1px solid var(--sand)", borderRadius:"var(--radiusLg)", marginBottom:16, overflow:"hidden" }}>
              <div style={{ background:"var(--bg2)", padding:"10px 14px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div>
                  <span style={{ fontWeight:600, fontSize:13 }}>{orden.numeroOrden ?? "—"}</span>
                  <span style={{ fontSize:11, color:"var(--txtMuted)", marginLeft:12 }}>{orden.fechaCompra ?? ""}</span>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:12 }}>
                  <span>Pago: <strong>{orden.formaPago ?? "—"}</strong></span>
                  <span>Total: <strong>{formatQTZ(Number(orden.valorCompra ?? 0))}</strong></span>
                  <StatusBadge status={String(orden.estado ?? "")} />
                </div>
              </div>
              {orden.muebles && orden.muebles.length > 0 && (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Artículo</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Cantidad</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Precio Unit.</th>
                      <th style={{ ...thStyle, textAlign:"right" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.muebles.map((m: any, j: number) => (
                      <tr key={j} style={{ background: j%2===0 ? "var(--bg3)" : "#fff" }}>
                        <td style={tdStyle}>{m.nombreArticulo ?? m.nombre_articulo ?? "—"}</td>
                        <td style={{ ...tdStyle, textAlign:"right" }}>{m.cantidad ?? "—"}</td>
                        <td style={{ ...tdStyle, textAlign:"right" }}>{formatQTZ(Number(m.precioUnitario ?? m.precio_unitario ?? 0))}</td>
                        <td style={{ ...tdStyle, textAlign:"right" }}>{formatQTZ(Number(m.subtotal ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Marketing helpers ─────────────────────────────────────────
const thM: React.CSSProperties = {
  padding:"8px 10px", textAlign:"left", fontSize:10, fontWeight:700,
  textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--txtMuted)",
  borderBottom:"2px solid var(--sand)", whiteSpace:"nowrap",
};
const tdM: React.CSSProperties = { padding:"8px 10px", fontSize:12, borderBottom:"1px solid var(--sand)" };

// ── Reporte Marketing: LTV ────────────────────────────────────
function RptMktLtv() {
  const [ciudad, setCiudad] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (ciudad.trim()) params.set("ciudad", ciudad.trim());
      const res = await apiClient.get<any>(`/reportes/marketing/ltv?${params}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:14 }}>
        <strong>LTV (Lifetime Value)</strong> — Valor total acumulado por cliente durante toda su relación comercial.
      </p>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Ciudad (opcional)</label>
          <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Todas"
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)", width:150 }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>
      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}
      {data && (
        <div>
          <p style={{ fontSize:12, color:"var(--txtMuted)", marginBottom:12 }}>
            Ciudad: {data.ciudad} · Generado: {data.fechaGeneracion}
          </p>
          {!data.clientes?.length ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin datos.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ background:"var(--bg2)" }}>
                  <th style={thM}>Cliente</th>
                  <th style={thM}>Email</th>
                  <th style={thM}>Ciudad</th>
                  <th style={{ ...thM, textAlign:"right" }}>Órdenes</th>
                  <th style={{ ...thM, textAlign:"right" }}>Valor Total</th>
                  <th style={{ ...thM, textAlign:"right" }}>Ticket Promedio</th>
                  <th style={thM}>Primera Compra</th>
                  <th style={thM}>Última Compra</th>
                </tr></thead>
                <tbody>
                  {data.clientes.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdM, fontWeight:600 }}>{r.nombreCliente ?? "—"}</td>
                      <td style={tdM}>{r.emailCliente ?? "—"}</td>
                      <td style={tdM}>{r.ciudadCliente ?? "—"}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{r.totalOrdenes ?? 0}</td>
                      <td style={{ ...tdM, textAlign:"right", color:"var(--gold)", fontWeight:700 }}>{formatQTZ(Number(r.valorTotalVida ?? 0))}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{formatQTZ(Number(r.ticketPromedio ?? 0))}</td>
                      <td style={tdM}>{r.primeraCompra ? String(r.primeraCompra).slice(0,10) : "—"}</td>
                      <td style={tdM}>{r.ultimaCompra  ? String(r.ultimaCompra).slice(0,10)  : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte Marketing: Actividad ──────────────────────────────
function RptMktActividad() {
  const today = new Date().toISOString().slice(0, 10);
  const [fi, setFi] = useState(today.slice(0, 7) + "-01");
  const [ff, setFf] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (fi) params.set("fechaInicio", fi);
      if (ff) params.set("fechaFin", ff);
      const res = await apiClient.get<any>(`/reportes/marketing/actividad?${params}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:14 }}>
        <strong>Actividad</strong> — Número de órdenes y ventas por día en el período seleccionado.
      </p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha inicio</label>
          <input type="date" value={fi} onChange={e => setFi(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha fin</label>
          <input type="date" value={ff} onChange={e => setFf(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>
      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}
      {data && (
        <div>
          <div style={{ display:"flex", gap:24, marginBottom:12, fontSize:12, color:"var(--txtMuted)" }}>
            <span>Generado: {data.fechaGeneracion}</span>
            <span style={{ fontWeight:700, color:"var(--dark)" }}>
              Total órdenes: {data.totalOrdenes} · Total ventas: {formatQTZ(Number(data.totalVentas ?? 0))}
            </span>
          </div>
          {!data.actividad?.length ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin actividad en el período.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ background:"var(--bg2)" }}>
                  <th style={thM}>Fecha</th>
                  <th style={{ ...thM, textAlign:"right" }}>Órdenes</th>
                  <th style={{ ...thM, textAlign:"right" }}>Clientes Únicos</th>
                  <th style={{ ...thM, textAlign:"right" }}>Total Ventas</th>
                </tr></thead>
                <tbody>
                  {data.actividad.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={tdM}>{r.fechaActividad ? String(r.fechaActividad).slice(0,10) : "—"}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{r.totalOrdenes ?? 0}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{r.clientesUnicos ?? 0}</td>
                      <td style={{ ...tdM, textAlign:"right", fontWeight:600 }}>{formatQTZ(Number(r.totalVentas ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte Marketing: Retención ──────────────────────────────
function RptMktRetencion() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get<any>("/reportes/marketing/retencion");
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:14 }}>
        <strong>Retención</strong> — Clientes que han realizado más de una compra (clientes recurrentes).
      </p>
      <div style={{ marginBottom:16 }}>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>
      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}
      {data && (
        <div>
          <p style={{ fontSize:12, color:"var(--txtMuted)", marginBottom:12 }}>
            Generado: {data.fechaGeneracion} ·{" "}
            <strong style={{ color:"var(--dark)" }}>{data.totalClientesRetenidos} clientes recurrentes</strong>
          </p>
          {!data.clientes?.length ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin clientes recurrentes.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ background:"var(--bg2)" }}>
                  <th style={thM}>Cliente</th>
                  <th style={thM}>Email</th>
                  <th style={{ ...thM, textAlign:"right" }}>Compras</th>
                  <th style={{ ...thM, textAlign:"right" }}>Total Gastado</th>
                  <th style={thM}>Primera Compra</th>
                  <th style={thM}>Última Compra</th>
                </tr></thead>
                <tbody>
                  {data.clientes.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdM, fontWeight:600 }}>{r.nombreCliente ?? "—"}</td>
                      <td style={tdM}>{r.emailCliente ?? "—"}</td>
                      <td style={{ ...tdM, textAlign:"right", fontWeight:700, color:"var(--olive)" }}>{r.totalCompras ?? 0}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{formatQTZ(Number(r.totalGastado ?? 0))}</td>
                      <td style={tdM}>{r.primeraCompra ? String(r.primeraCompra).slice(0,10) : "—"}</td>
                      <td style={tdM}>{r.ultimaCompra  ? String(r.ultimaCompra).slice(0,10)  : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte Marketing: Cohorte ────────────────────────────────
function RptMktCohorte() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get<any>("/reportes/marketing/cohorte");
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  // Build pivot: cohorte rows × actividad columns
  const pivot = React.useMemo(() => {
    if (!data?.filas) return { cohortes: [] as string[], meses: [] as string[], map: {} as Record<string, Record<string, number>> };
    const cohortes = [...new Set((data.filas as any[]).map(r => String(r.mesCohorte ?? "")))].sort();
    const meses    = [...new Set((data.filas as any[]).map(r => String(r.mesActividad ?? "")))].sort();
    const map: Record<string, Record<string, number>> = {};
    (data.filas as any[]).forEach(r => {
      const c = String(r.mesCohorte ?? ""); const m = String(r.mesActividad ?? "");
      if (!map[c]) map[c] = {};
      map[c][m] = Number(r.clientesActivos ?? 0);
    });
    return { cohortes, meses, map };
  }, [data]);

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:14 }}>
        <strong>Análisis de Cohorte</strong> — Clientes agrupados por mes de primera compra y su actividad mensual posterior.
      </p>
      <div style={{ marginBottom:16 }}>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>
      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}
      {data && (
        <div>
          <p style={{ fontSize:12, color:"var(--txtMuted)", marginBottom:12 }}>Generado: {data.fechaGeneracion}</p>
          {!data.filas?.length ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin datos de cohorte.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead><tr style={{ background:"var(--bg2)" }}>
                  <th style={{ ...thM, minWidth:90 }}>Cohorte</th>
                  {pivot.meses.map(m => <th key={m} style={{ ...thM, textAlign:"center", minWidth:70 }}>{m}</th>)}
                </tr></thead>
                <tbody>
                  {pivot.cohortes.map((c, i) => (
                    <tr key={c} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdM, fontWeight:700 }}>{c}</td>
                      {pivot.meses.map(m => {
                        const v = pivot.map[c]?.[m];
                        const isSame = c === m;
                        return (
                          <td key={m} style={{
                            ...tdM, textAlign:"center",
                            background: v ? (isSame ? "rgba(180,145,60,0.15)" : "rgba(46,106,79,0.08)") : undefined,
                            fontWeight: v ? 600 : 400,
                            color: v ? "var(--dark)" : "var(--txtMuted)",
                          }}>
                            {v || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte Marketing: Remarketing ────────────────────────────
function RptMktRemarketing() {
  const [dias, setDias] = useState("30");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get<any>(`/reportes/marketing/remarketing?diasInactivo=${dias}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:14 }}>
        <strong>Remarketing</strong> — Clientes inactivos sin compras en los últimos N días. Ideal para campañas de reactivación.
      </p>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Días de inactividad</label>
          <input type="number" value={dias} onChange={e => setDias(e.target.value)} min="1"
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)", width:100 }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>
      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}
      {data && (
        <div>
          <p style={{ fontSize:12, color:"var(--txtMuted)", marginBottom:12 }}>
            Generado: {data.fechaGeneracion} · Inactivos &gt; {data.diasInactivo} días:{" "}
            <strong style={{ color:"var(--danger)" }}>{data.totalClientes} clientes</strong>
          </p>
          {!data.clientes?.length ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>No hay clientes inactivos en ese período.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ background:"var(--bg2)" }}>
                  <th style={thM}>Cliente</th>
                  <th style={thM}>Email</th>
                  <th style={thM}>Ciudad</th>
                  <th style={{ ...thM, textAlign:"right" }}>Días inactivo</th>
                  <th style={thM}>Última Compra</th>
                  <th style={{ ...thM, textAlign:"right" }}>Compras Hist.</th>
                  <th style={{ ...thM, textAlign:"right" }}>Valor Hist.</th>
                </tr></thead>
                <tbody>
                  {data.clientes.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdM, fontWeight:600 }}>{r.nombreCliente ?? "—"}</td>
                      <td style={tdM}>{r.emailCliente ?? "—"}</td>
                      <td style={tdM}>{r.ciudadCliente ?? "—"}</td>
                      <td style={{ ...tdM, textAlign:"right", color:"var(--danger)", fontWeight:700 }}>{r.diasInactivo ?? "—"}</td>
                      <td style={tdM}>{r.ultimaCompra ? String(r.ultimaCompra).slice(0,10) : "—"}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{r.totalComprasHist ?? 0}</td>
                      <td style={{ ...tdM, textAlign:"right" }}>{formatQTZ(Number(r.valorHist ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reporte: Cierre de Caja ───────────────────────────────────
function RptCierreCaja() {
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get<any>(`/reportes/cierre-caja?fecha=${fecha}`);
      setData(res.data ?? res);
    } catch (e: any) { setError(e.message ?? "Error al cargar reporte"); }
    finally { setLoading(false); }
  };

  const thStyle: React.CSSProperties = { padding:"10px 14px", textAlign:"left", fontSize:10,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--txtMuted)",
    borderBottom:"2px solid var(--sand)", whiteSpace:"nowrap" };
  const tdStyle: React.CSSProperties = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid var(--sand)" };

  return (
    <div>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:20 }}>
        <div>
          <label style={{ fontSize:11, color:"var(--txtMuted)", display:"block", marginBottom:4 }}>Fecha de cierre</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding:"7px 10px", border:"1px solid var(--sand)", borderRadius:"var(--radius)", fontSize:13, background:"var(--bg3)" }} />
        </div>
        <Button onClick={load} loading={loading}>Generar</Button>
      </div>

      {error && <p style={{ color:"var(--danger)", fontSize:12, marginBottom:12 }}>{error}</p>}

      {data && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontSize:12, color:"var(--txtMuted)" }}>
              Fecha: <strong>{data.fechaCierre}</strong> · Generado: {data.fechaGeneracion}
            </div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--gold)" }}>
              Total: {formatQTZ(Number(data.totalGeneral ?? 0))}
            </div>
          </div>

          {(!data.detallesPorMetodo || data.detallesPorMetodo.length === 0) ? (
            <p style={{ textAlign:"center", color:"var(--txtMuted)", padding:40 }}>Sin transacciones para la fecha seleccionada.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--bg2)" }}>
                    <th style={thStyle}>Forma de Pago</th>
                    <th style={{ ...thStyle, textAlign:"right" }}>Transacciones</th>
                    <th style={{ ...thStyle, textAlign:"right" }}>Subtotal</th>
                    <th style={{ ...thStyle, textAlign:"right" }}>Impuesto</th>
                    <th style={{ ...thStyle, textAlign:"right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.detallesPorMetodo.map((r: any, i: number) => (
                    <tr key={i} style={{ background: i%2===0 ? "var(--bg3)" : "var(--bg2)" }}>
                      <td style={{ ...tdStyle, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                        <span>{(r.formaPago ?? r.forma_pago ?? "").toLowerCase() === "card" ? "💳" : "🏦"}</span>
                        {r.formaPago ?? r.forma_pago ?? "—"}
                      </td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>{r.totalTransacciones ?? r.total_transacciones ?? "—"}</td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>{formatQTZ(Number(r.totalSubtotal ?? r.total_subtotal ?? 0))}</td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>{formatQTZ(Number(r.totalImpuesto ?? r.total_impuesto ?? 0))}</td>
                      <td style={{ ...tdStyle, textAlign:"right", fontWeight:700 }}>{formatQTZ(Number(r.totalGeneral ?? r.total_general ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background:"var(--dark)", color:"#fff" }}>
                    <td style={{ ...tdStyle, fontWeight:700, color:"#fff" }}>TOTAL GENERAL</td>
                    <td colSpan={3} style={{ ...tdStyle, color:"#fff" }}></td>
                    <td style={{ ...tdStyle, textAlign:"right", fontWeight:700, color:"var(--gold)", fontSize:16 }}>
                      {formatQTZ(Number(data.totalGeneral ?? 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
