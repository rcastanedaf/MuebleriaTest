// features/admin/data/adminRepository.ts
import { apiClient } from "../../../core/api/apiClient";
import { handleApiError } from "../../../core/errors/AppError";

export interface AdminRepo<T> {
  getAll(params?: Record<string,any>): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<void>;
  remove(id: number): Promise<void>;
}

export function createRepo<T>(resource: string): AdminRepo<T> {
  const base = `/${resource}`;
  return {
    async getAll(params) {
      try {
        const r = await apiClient.get<{ data: T[] }>(base, params);
        return (r as any).data ?? (r as any) ?? [];
      } catch(e) { throw handleApiError(e); }
    },
    async getById(id) {
      try { return await apiClient.get<T>(`${base}/${id}`); }
      catch(e) { throw handleApiError(e); }
    },
    async create(data) {
      try { return await apiClient.post<T>(base, data); }
      catch(e) { throw handleApiError(e); }
    },
    async update(id, data) {
      try { await apiClient.put(`${base}/${id}`, data); }
      catch(e) { throw handleApiError(e); }
    },
    async remove(id) {
      try { await apiClient.delete(`${base}/${id}`); }
      catch(e) { throw handleApiError(e); }
    },
  };
}

// ── Pre-built repos para todos los módulos del DDL ────────────
import type {
  Empresa, Sucursal, Rol, Usuario, Permiso, Moneda, TipoCambio,
  Departamento, Municipio,
  DepartamentoRRHH, CargoRRHH, Jornada, TipoContrato, Empleado,
  Asistencia, Vacacion, Nomina, NominaDetalle,
  CategoriaArticulo, Articulo, UnidadMedida, Bodega, StockArticulo,
  Proveedor, SolicitudCompra, OrdenCompra, RecepcionMercaderia,
  Cliente, ListaPrecios, OrdenVenta, SalidaMercaderia, FacturaVenta, DevolucionVenta,
  CentroTrabajo, ListaMateriales, OrdenProduccion,
  Vehiculo, Transportista, OrdenDespacho, Entrega,
} from "../../../core/types";

// Configuración
export const empresasRepo       = createRepo<Empresa>("empresas");
export const sucursalesRepo     = createRepo<Sucursal>("sucursales");
export const rolesRepo          = createRepo<Rol>("roles");
export const usuariosRepo       = createRepo<Usuario>("usuarios");
export const permisosRepo       = createRepo<Permiso>("permisos");
export const monedasRepo        = createRepo<Moneda>("monedas");
export const tipoCambioRepo     = createRepo<TipoCambio>("tipo-cambio");
export const departamentosRepo  = createRepo<Departamento>("departamentos");
export const municipiosRepo     = createRepo<Municipio>("municipios");
// RRHH
export const deptRRHHRepo       = createRepo<DepartamentoRRHH>("departamentos-rrhh");
export const cargosRepo         = createRepo<CargoRRHH>("cargos-rrhh");
export const jornadasRepo       = createRepo<Jornada>("jornadas");
export const tiposContratoRepo  = createRepo<TipoContrato>("tipos-contrato");
export const empleadosRepo      = createRepo<Empleado>("empleados");
export const asistenciaRepo     = createRepo<Asistencia>("asistencia");
export const vacacionesRepo     = createRepo<Vacacion>("vacaciones");
export const nominaRepo         = createRepo<Nomina>("nomina");
export const nominaDetalleRepo  = createRepo<NominaDetalle>("nomina-detalle");
// Inventario
export const categoriasRepo     = createRepo<CategoriaArticulo>("categorias-articulo");
export const articulosRepo      = createRepo<Articulo>("articulos");
export const unidadesMedidaRepo = createRepo<UnidadMedida>("unidades-medida");
export const bodegasRepo        = createRepo<Bodega>("bodegas");
export const stockRepo          = createRepo<StockArticulo>("stock-articulo");
// Compras
export const proveedoresRepo    = createRepo<Proveedor>("proveedores");
export const solicitudesRepo    = createRepo<SolicitudCompra>("solicitudes-compra");
// Custom repo for ordenes-compra (only estado update)
export const ordenesCompraRepo: AdminRepo<OrdenCompra> = {
  ...createRepo<OrdenCompra>("ordenes-compra"),
  async update(id, data) {
    try {
      await apiClient.put(`ordenes-compra/${id}`, { estadoOrdenCompra: data.estadoOrdenCompra });
    } catch(e) { throw handleApiError(e); }
  },
};
export const recepcionRepo      = createRepo<RecepcionMercaderia>("recepciones-mercaderia");
// Ventas
export const clientesRepo       = createRepo<Cliente>("clientes");
export const listaPreciosRepo   = createRepo<ListaPrecios>("lista-precios");
// Custom repo for ordenes-venta (only estado update)
export const ordenesVentaRepo: AdminRepo<OrdenVenta> = {
  ...createRepo<OrdenVenta>("ordenes-venta"),
  async update(id, data) {
    try {
      await apiClient.put(`ordenes-venta/${id}`, { estado: data.estadoOrdenVenta });
    } catch(e) { throw handleApiError(e); }
  },
};
export const salidaRepo         = createRepo<SalidaMercaderia>("salidas-mercaderia");
export const facturasRepo       = createRepo<FacturaVenta>("facturas-venta");
export const devolucionesRepo   = createRepo<DevolucionVenta>("devoluciones-venta");
// Producción
export const centrosTrabajoRepo = createRepo<CentroTrabajo>("centros-trabajo");
export const bomRepo            = createRepo<ListaMateriales>("lista-materiales");
export const ordenesProducRepo  = createRepo<OrdenProduccion>("ordenes-produccion");
// Transporte
export const vehiculosRepo      = createRepo<Vehiculo>("vehiculos");
export const transportistasRepo = createRepo<Transportista>("transportistas");
export const despachosRepo      = createRepo<OrdenDespacho>("ordenes-despacho");
export const entregasRepo       = createRepo<Entrega>("entregas");
