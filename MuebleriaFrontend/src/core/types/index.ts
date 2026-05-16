// core/types/index.ts — Interfaces TypeScript del DDL Oracle 21c

export type EstadoAI   = "A" | "I";
export type EstadoPARC = "P" | "A" | "R" | "C";

export interface PaginatedResult<T> { data: T[]; total: number; page: number; pageSize: number; }
export interface PaginationParams   { page?: number; pageSize?: number; search?: string; }

// ── Geografía ────────────────────────────────────────────────
export interface Departamento {
  idDepartamento: number; nombreDepartamento: string;
  frecuenciaDepartamento?: string; zonaTerritorialDepartamento?: string;
}
export interface Municipio {
  idMunicipio: number; nombreMunicipio: string;
  codigoPostalMunicipio?: string; idDepartamento: number;
}

// ── Configuración General ────────────────────────────────────
export interface Empresa {
  idEmpresa: number; nombreEmpresa: string; nitEmpresa: string;
  razonSocialEmpresa: string; direccionEmpresa?: string;
  logoEmpresa?: string; estadoEmpresa: EstadoAI;
}
export interface Sucursal {
  idSucursal: number; codigoSucursal: string; nombreSucursal: string;
  direccionSucursal?: string; emailSucursal?: string;
  estadoSucursal: EstadoAI; idEmpresa: number; idMunicipio?: number;
  nombreEmpresa?: string;
}
export interface Rol {
  idRol: number; nombreRol: string; descripcionRol?: string; rangoRol?: number;
}
export interface Usuario {
  idUsuario: number; usernameUsuario: string; emailUsuario: string;
  ultimoAccesoUsuario?: string; estadoUsuario: EstadoAI;
  idRol: number; idSucursal: number; nombreRol?: string; nombreSucursal?: string;
}
export interface Permiso {
  idPermiso: number; nombrePermiso: string; descripcionPermiso?: string;
  moduloPermiso: string; estado: EstadoAI; idRol: number;
}
export interface Moneda {
  idMoneda: number; codigoMoneda: string; nombreMoneda: string;
  simboloMoneda: string; decimalesMoneda: number;
}
export interface TipoCambio {
  idTipoCambio: number; fechaTipoCambio: string; tasaTipoCambio: number;
  idMonedaOrigen: number; idMonedaDestino: number;
  codOrigen?: string; codDestino?: string;
}

// ── RRHH ─────────────────────────────────────────────────────
export interface DepartamentoRRHH {
  idDepartamentoRRHH: number; nombreDepartamentoRRHH: string;
  codigoDepartamentoRRHH: string; idSucursal: number;
  idDepartamentoRRHHPadre?: number; nombreSucursal?: string;
}
export interface CargoRRHH {
  idCargoRRHH: number; nombreCargoRRHH: string; nivelCargoRRHH?: string;
  salarioMinCargoRRHH?: number; salarioMaxCargoRRHH?: number;
  idDepartamentoRRHH: number; nombreDepartamentoRRHH?: string;
}
export interface Jornada {
  idJornada: number; nombreJornada: string; codigoJornada: string;
  horaInJornada?: string; horaFinJornada?: string;
  horaDescansoJornada?: string; observacionesJornada?: string;
}
export interface TipoContrato {
  idTipoContrato: number; codigoTipoContrato: string; nombreTipoContrato: string;
  duracionTipoContrato?: number; prestacionesTipoContrato?: string;
  horaExtraTipoContrato?: number;
}
export interface Empleado {
  idEmpleado: number; numeroEmpleado: string; dpiEmpleado: string;
  nombresEmpleado: string; apellidosEmpleado: string;
  fechaNacimientoEmpleado?: string; generoEmpleado?: "M" | "F" | "O";
  emailCorporativoEmpleado?: string; fechaIngresoEmpleado: string;
  estadoEmpleado: EstadoAI; idCargo?: number; nombreCargoRRHH?: string;
}
export interface Asistencia {
  idAsistencia: number; fechaAsistencia: string;
  horaInAsistencia?: string; horaSalAsistencia?: string;
  horasTrabajoAsistencia?: number; horasExtrAsistencia?: number;
  estadoAsistencia: EstadoAI; idEmpleado: number;
  nombresEmpleado?: string; apellidosEmpleado?: string;
}
export interface Vacacion {
  idVacacion: number; fechaInicioVacacion: string; fechaFinVacacion: string;
  diasVacaciones?: number; estadoVacacion: "A" | "I" | "P";
  idEmpleado: number; nombresEmpleado?: string; apellidosEmpleado?: string;
}
export interface Nomina {
  idNomina: number; periodoNomina: string; fechaPagoNomina: string;
  totalBrutoNomina: number; totalDescuentosNomina: number;
  totalNetoNomina: number; estadoNomina: "A" | "I" | "C";
  idSucursal: number; nombreSucursal?: string;
}
export interface NominaDetalle {
  idNominaDetalle: number; salarioBasicoNominaDetalle: number;
  horasExtrNominaDetalle: number; bonificacionNominaDetalle: number;
  descuentoSeguroNominaDetalle: number; descuentoImpuestoNominaDetalle: number;
  netoPagarNominaDetalle: number; idNomina: number; idEmpleado: number;
  nombresEmpleado?: string; periodoNomina?: string;
}

// ── Inventario ───────────────────────────────────────────────
export interface CategoriaArticulo {
  idCategoriasArticulo: number; nombreCategoriaArticulo: string;
  codigoCategoriaArticulo: string; nivelCategoriaArticulo?: number;
  idCategoriaArticuloPadre?: number;
}
export interface Articulo {
  idArticulo: number; codigoArticulo: string; codigoBarraArticulo?: string;
  nombreArticulo: string; descripcionArticulo?: string;
  tipoArticulo?: string; manejaLoteArticulo?: string; manejaSerieArticulo?: string;
  stockMinimo?: number; stockMaximo?: number; pesoArticulo?: number;
  estadoArticulo: EstadoAI; idCategoriaArticulo?: number;
  nombreCategoriaArticulo?: string;
  // Campos requeridos por PDF seccion 2
  materialArticulo?: string; colorArticulo?: string;
  altoArticulo?: number; anchoArticulo?: number; profundidadArticulo?: number;
  fotoNombreArticulo?: string; fotoTipoArticulo?: string; tieneFoto?: number;
  // portal fields (joined)
  stockDisponible?: number; precio?: number;
}
export interface UnidadMedida {
  idUnidadMedida: number; nombreUnidadMedida: string;
  descripcionUnidadMedida?: string; descuentoUnidadMedida?: number;
}
export interface Bodega {
  idBodega: number; codigoBodega: string; nombreBodega: string;
  tipoBodega?: string; direccionBodega?: string;
  estadoBodega: EstadoAI; idSucursal: number; nombreSucursal?: string;
}
export interface StockArticulo {
  idStockArticulo: number; cantidadDiponibleStockArticulo: number;
  cantidadReservadaStockArticulo: number; costoPromedioStockArticulo: number;
  idArticulo: number; nombreArticulo?: string; codigoArticulo?: string;
}

// ── Compras ──────────────────────────────────────────────────
export interface Proveedor {
  idProveedor: number; codigoProveedor: string; razonSocialProveedor: string;
  nitProveedor: string; telefonoProveedor?: string; emailProveedor?: string;
  plazoPagoProveedor?: number; clasificacionProveedor?: string;
  estadoProveedor: EstadoAI; idMoneda?: number; codigoMoneda?: string;
}
export interface SolicitudCompra {
  idSolicitudCompra: number; numeroSolicitudCompra: string;
  fechaSolicitudCompra: string; observacionSolicitudCompra?: string;
  estadoSolicitud: EstadoPARC; idSucursal?: number; nombreSucursal?: string;
}
export interface OrdenCompra {
  idOrdenCompra: number; numeroOrdenCompra: string;
  fechaSolicitudOrdenCompra: string; subtotalOrdenCompra: number;
  impuestoOrdenCompra: number; totalOrdenCompra: number;
  estadoOrdenCompra: EstadoPARC; idProveedor: number;
  razonSocialProveedor?: string; codigoMoneda?: string;
}
export interface RecepcionMercaderia {
  idRecepcionMercaderia: number; numeroRecepcionMercaderia: string;
  fechaIngresoRecepcionMercaderia: string;
  observacionRecepcionMercaderia?: string;
  totalPiezasRecepcionMercaderia?: number; idOrdenCompra: number;
  numeroOrdenCompra?: string;
}

// ── Ventas ───────────────────────────────────────────────────
export interface Cliente {
  idCliente: number; codigoCliente: string; razonSocialCliente: string;
  nitCliente: string; limiteCreditoCliente?: number; telefonoCliente?: string;
  emailCliente?: string; plazoPagoClientes?: number;
  estadoCliente: EstadoAI; idListaPrecios?: number; nombreListaPrecios?: string;
  // Campos requeridos por PDF seccion 1
  tipoDocumentoCliente?: string; numeroDocumentoCliente?: string;
  nombresCliente?: string; telResidenciaCliente?: string;
  telCelularCliente?: string; direccionCliente?: string;
  ciudadCliente?: string; departamentoCliente?: string;
  paisCliente?: string; profesionCliente?: string;
  tipoPersonaCliente?: "N" | "J";
}
export interface ListaPrecios {
  idListaPrecios: number; nombreListaPrecios: string;
  fechaDesdeListaPrecios: string; fechaHastaListaPrecios?: string;
  idMoneda?: number; codigoMoneda?: string;
}
export interface ListaPreciosDet {
  idListaPreciosDet: number; precioListaPreciosDet: number;
  descuentoMaxListaPreciosDet?: number; idListaPrecios: number;
  idArticulo: number; nombreArticulo?: string; codigoArticulo?: string;
}
export interface OrdenVenta {
  idOrdenVenta: number; numeroOrdenVenta: string;
  fechaSolicitudOrdenVenta: string; fechaEntregaOrdenVenta?: string;
  subtotalOrdenVenta: number; impuestoOrdenVenta: number;
  totalOrdenVenta: number; estadoOrdenVenta: "P" | "A" | "D" | "F" | "C";
  nombreSucursal?: string;
}
export interface SalidaMercaderia {
  idSalidaMercaderia: number; numeroSalidaMercaderia: string;
  fechaSolicitudSalidaMercaderia: string;
  estadoSalidaMercaderia: "P" | "A" | "C"; idOrdenVenta: number;
  numeroOrdenVenta?: string;
}
export interface FacturaVenta {
  idFacturaVenta: number; serieFacturaVenta: string;
  correlativoFacturaVenta: string; fechaFacturaVenta: string;
  totalFacturaVenta: number; estadoSalidaMercaderia: string;
  idSalidaMercaderia?: number;
}
export interface DevolucionVenta {
  idDevolucionVenta: number; numeroDevolucion: string;
  motivoDevolucion: string; fechaDevolucionVenta: string;
  totalDevolucionVenta: number; estadoDevolucionVenta: "P" | "A" | "R";
  idSalidaMercaderia?: number;
}

// ── Producción ───────────────────────────────────────────────
export interface CentroTrabajo {
  idCentroTrabajo: number; codigoCentroTrabajo: string;
  nombreCentroTrabajo: string; capacidadHora?: number;
  estadoCentroTrabajo: EstadoAI; idSucursal?: number; nombreSucursal?: string;
}
export interface ListaMateriales {
  idListaMateriales: number; codigoListaMateriales: string;
  nombreListaMateriales: string; cantidadProduceListaMateriales: number;
  estadoListaMateriales: EstadoAI; idArticulo: number; nombreArticulo?: string;
}
export interface OrdenProduccion {
  idOrdenProduccion: number; codigoOrdenProduccion: string;
  fechaInOrdenProduccion: string; fechaFinOrdenProduccion?: string;
  cantidadPlanificadaOrdenProduccion: number;
  cantidadProducidaOridenProduccion: number;
  estadoOrdenProduccion: "P" | "E" | "C" | "R";
  idListaMateriales?: number; idCentroTrabajo?: number;
  nombreCentroTrabajo?: string; nombreListaMateriales?: string;
}

// ── Transporte ───────────────────────────────────────────────
export interface Vehiculo {
  idVehiculo: number; placaVehiculo: string; marcaVehiculo?: string;
  modeloVehiculo?: string; tipoVehiculo?: string;
  capacidadKgVehiculo?: number; estadoVehiculo: "A" | "I" | "M";
  idSucursal?: number; nombreSucursal?: string;
}
export interface Transportista {
  idTransportista: number; nombreTransportista: string;
  apellidosTransportista: string; licenciaTransportista: string;
  dpiTransportista?: string; tipoLicTransportista?: string;
  estadoTransportista: EstadoAI; idEmpleado?: number; nombresEmpleado?: string;
}
export interface OrdenDespacho {
  idOrdenDespacho: number; nombreOrdenDespacho?: string;
  fechaCreaOrdenDespacho: string; fechaEntregaOrdenDespacho?: string;
  estadoOrdenDespachado: "P" | "D" | "E" | "C";
  idVehiculo?: number; idTransportista?: number;
  placaVehiculo?: string; nombreTransportista?: string;
}
export interface Entrega {
  idEntrega: number; fechaEntrega: string; nombreRecibeEntrega?: string;
  apellidosRecibeEntrega?: string; observacionEntrega?: string;
  ubicacionEntrega?: string; idDespachoDetalle: number;
}

// ── Auth / Portal ─────────────────────────────────────────────
export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload {
  name: string; email: string; password: string; nit: string;
  phone?: string; address?: string; city?: string; country?: string;
  // Campos adicionales requeridos por PDF seccion 1
  tipoDocumento?: string; numeroDocumento?: string;
  telefonoResidencia?: string; telefonoCelular?: string;
  departamento?: string; profesion?: string;
  tipoPersona?: "N" | "J";
}
export interface AuthResponse    { token: string; user: AuthUser; }
export interface AuthUser {
  id: number; name: string; email: string; nit?: string;
  phone?: string; city?: string; country?: string; role: "admin" | "cliente";
  idSucursal?: number; idCliente?: number;
}
export interface CartItem {
  cartId: number; idArticulo: number; codigoArticulo: string;
  nombreArticulo: string; tipoArticulo?: string;
  precio: number; qty: number; stock: number;
}
export interface CheckoutPayload {
  clienteId: number; subtotal: number; impuesto: number; total: number;
  metodoPago: "card" | "transfer"; descripcion: string;
  items: Array<{ articuloId: number; cantidad: number; precioUnitario: number }>;
}
export interface OrderResult {
  id: number; numero: string; fecha: string; total: number; estado: string;
}
export interface OrderDetailItem {
  idOrdenVentaDetalle: number; idArticulo: number; codigoArticulo: string;
  nombreArticulo: string; cantidad: number; precioUnitario: number;
  subtotal: number; estadoOrdenVentaDetalle: string;
}
export interface OrderDetail {
  cabecera: {
    idOrdenVenta: number; numeroOrdenVenta: string; fechaSolicitudOrdenVenta: string;
    fechaEntregaOrdenVenta?: string; subtotalOrdenVenta: number; impuestoOrdenVenta: number;
    totalOrdenVenta: number; estadoOrdenVenta: string; nombreSucursal?: string;
  };
  detalle: OrderDetailItem[];
}
