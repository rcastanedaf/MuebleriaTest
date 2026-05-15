export type EstadoAI = "A" | "I";

export interface AuthUser {
  idUsuario: number;
  username: string;
  email: string;
  rol: string;
  token: string;
}

export interface Empresa {
  idEmpresa: number; nombreEmpresa: string; nitEmpresa: string;
  razonSocialEmpresa: string; estadoEmpresa: EstadoAI;
}
export interface Sucursal {
  idSucursal: number; codigoSucursal: string; nombreSucursal: string;
  emailSucursal?: string; estadoSucursal: EstadoAI;
  idEmpresa: number; nombreEmpresa?: string;
}
export interface Rol {
  idRol: number; nombreRol: string; descripcionRol?: string; rangoRol?: number;
}
export interface Usuario {
  idUsuario: number; usernameUsuario: string; emailUsuario: string;
  estadoUsuario: EstadoAI; nombreRol?: string; ultimoAccesoUsuario?: string;
}
export interface Empleado {
  idEmpleado: number; numeroEmpleado: string;
  nombresEmpleado: string; apellidosEmpleado: string;
  nombreCargoRRHH?: string; estadoEmpleado: EstadoAI;
}
export interface CargoRRHH {
  idCargoRRHH: number; nombreCargoRRHH: string;
}
export interface Nomina {
  idNomina: number; periodoNomina: string; fechaPagoNomina: string;
  totalNetoNomina: number; estadoNomina: string; nombreSucursal?: string;
}
export interface Articulo {
  idArticulo: number; codigoArticulo: string; nombreArticulo: string;
  tipoArticulo?: string; precio: number; stockDisponible: number;
  estadoArticulo: EstadoAI; descripcionArticulo?: string;
  nombreCategoriaArticulo?: string;
}
export interface Bodega {
  idBodega: number; codigoBodega: string; nombreBodega: string;
  tipoBodega?: string; estadoBodega: EstadoAI; nombreSucursal?: string;
}
export interface Proveedor {
  idProveedor: number; codigoProveedor: string; razonSocialProveedor: string;
  nitProveedor?: string; emailProveedor?: string; estadoProveedor: EstadoAI;
}
export interface OrdenCompra {
  idOrdenCompra: number; numeroOrdenCompra: string;
  fechaSolicitudOrdenCompra: string; razonSocialProveedor?: string;
  totalOrdenCompra: number; estadoOrdenCompra: string;
}
export interface Cliente {
  idCliente: number; codigoCliente: string; razonSocialCliente: string;
  nitCliente?: string; emailCliente?: string; estadoCliente: EstadoAI;
}
export interface ListaPrecios {
  idListaPrecios: number; nombreListaPrecios: string;
}
export interface OrdenVenta {
  idOrdenVenta: number; numeroOrdenVenta: string;
  fechaSolicitudOrdenVenta: string; totalOrdenVenta: number;
  estadoOrdenVenta: string;
}
export interface OrdenVentaDetalle {
  idDetalleOrdenVenta: number; nombreArticulo: string;
  cantidadOrdenVenta: number; precioUnitarioOrdenVenta: number;
  subtotalOrdenVenta: number;
}
export interface OrdenVentaCompleta {
  cabecera: OrdenVenta;
  detalles: OrdenVentaDetalle[];
}
export interface CentroTrabajo {
  idCentroTrabajo: number; nombreCentroTrabajo: string;
}
export interface ListaMateriales {
  idListaMateriales: number; nombreListaMateriales: string;
}
export interface OrdenProduccion {
  idOrdenProduccion: number; codigoOrdenProduccion: string;
  nombreListaMateriales?: string; cantidadPlanificadaOrdenProduccion: number;
  estadoOrdenProduccion: string;
}
export interface Vehiculo {
  idVehiculo: number; placaVehiculo: string; marcaVehiculo: string;
  modeloVehiculo?: string; tipoVehiculo?: string; estadoVehiculo: EstadoAI;
}
export interface Transportista {
  idTransportista: number; nombreTransportista: string; apellidosTransportista: string;
}
export interface OrdenDespacho {
  idOrdenDespacho: number; nombreOrdenDespacho: string;
  fechaCreaOrdenDespacho: string; placaVehiculo?: string;
  nombreTransportista?: string; estadoOrdenDespachado: string;
}

export interface CartItem {
  articulo: Articulo;
  cantidad: number;
}
