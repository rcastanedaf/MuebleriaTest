import { apiClient } from "../../../core/api/apiClient";

/**
 * Interfaz para las estadísticas principales del dashboard
 */
export interface DashboardStats {
  articulosActivos: number;
  ordenesPendientes: number;
  clientesActivos: number;
  despachosEnRuta: number;
}

/**
 * Interfaz para el resumen de ventas
 */
export interface SalesSummary {
  totalOrdenes: number;
  totalVentas: number;
  promedioVenta: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
  ordenesCompletadas: number;
}

/**
 * Interfaz para productos principales
 */
export interface TopProduct {
  codigo: string;
  nombre: string;
  cantidadVendida: number;
  totalVendido: number;
}

/**
 * Interfaz para datos mensuales
 */
export interface MonthlySales {
  mes: string;
  total: number;
}

/**
 * Interfaz para artículos con stock bajo
 */
export interface LowStockItem {
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  estado: "CRITICO" | "BAJO" | "OK";
}

/**
 * Interfaz para órdenes pendientes
 */
export interface PendingOrders {
  totalPendientes: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
}

/**
 * Interfaz para clientes nuevos
 */
export interface NewClients {
  totalNuevos: number;
  clientesConCompras: number;
}

/**
 * Interfaz para inventario por categoría
 */
export interface InventoryByCategory {
  categoria: string;
  totalArticulos: number;
  cantidadTotal: number;
}

/**
 * Interfaz para ventas recientes
 */
export interface RecentSale {
  id: number;
  numero: string;
  fecha: string;
  total: number;
  estado: string;
  cliente: string;
}

/**
 * Interfaz para estado de despachos
 */
export interface DispatchStatus {
  totalDespachos: number;
  pendientes: number;
  enProgreso: number;
  completados: number;
}

/**
 * Repositorio para obtener datos del dashboard
 */
export const dashboardRepository = {
  /**
   * Obtiene las estadísticas principales
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const data = await apiClient.get<DashboardStats>("/dashboard/stats");
      return data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  },

  /**
   * Obtiene resumen de ventas del mes
   */
  async getSalesSummary(): Promise<SalesSummary> {
    try {
      const data = await apiClient.get<SalesSummary>("/dashboard/sales-summary");
      return data;
    } catch (error) {
      console.error("Error al obtener resumen de ventas:", error);
      throw error;
    }
  },

  /**
   * Obtiene top 5 productos vendidos
   */
  async getTopProducts(): Promise<TopProduct[]> {
    try {
      const data = await apiClient.get<TopProduct[]>("/dashboard/top-products");
      return data;
    } catch (error) {
      console.error("Error al obtener productos principales:", error);
      throw error;
    }
  },

  /**
   * Obtiene ventas por mes (últimos 6 meses)
   */
  async getSalesByMonth(): Promise<MonthlySales[]> {
    try {
      const data = await apiClient.get<MonthlySales[]>("/dashboard/sales-by-month");
      return data;
    } catch (error) {
      console.error("Error al obtener ventas por mes:", error);
      throw error;
    }
  },

  /**
   * Obtiene artículos con stock bajo
   */
  async getLowStock(): Promise<LowStockItem[]> {
    try {
      const data = await apiClient.get<LowStockItem[]>("/dashboard/low-stock");
      return data;
    } catch (error) {
      console.error("Error al obtener stock bajo:", error);
      throw error;
    }
  },

  /**
   * Obtiene órdenes de compra pendientes
   */
  async getPendingOrders(): Promise<PendingOrders> {
    try {
      const data = await apiClient.get<PendingOrders>("/dashboard/pending-orders");
      return data;
    } catch (error) {
      console.error("Error al obtener órdenes pendientes:", error);
      throw error;
    }
  },

  /**
   * Obtiene clientes nuevos del mes
   */
  async getNewClients(): Promise<NewClients> {
    try {
      const data = await apiClient.get<NewClients>("/dashboard/new-clients");
      return data;
    } catch (error) {
      console.error("Error al obtener clientes nuevos:", error);
      throw error;
    }
  },

  /**
   * Obtiene inventario por categoría
   */
  async getInventoryByCategory(): Promise<InventoryByCategory[]> {
    try {
      const data = await apiClient.get<InventoryByCategory[]>("/dashboard/inventory-by-category");
      return data;
    } catch (error) {
      console.error("Error al obtener inventario por categoría:", error);
      throw error;
    }
  },

  /**
   * Obtiene últimas órdenes de venta
   */
  async getRecentSales(limit: number = 10): Promise<RecentSale[]> {
    try {
      const data = await apiClient.get<RecentSale[]>("/dashboard/recent-sales", { limit });
      return data;
    } catch (error) {
      console.error("Error al obtener ventas recientes:", error);
      throw error;
    }
  },

  /**
   * Obtiene estado de despachos
   */
  async getDispatchStatus(): Promise<DispatchStatus> {
    try {
      const data = await apiClient.get<DispatchStatus>("/dashboard/dispatch-status");
      return data;
    } catch (error) {
      console.error("Error al obtener estado de despachos:", error);
      throw error;
    }
  },
};
