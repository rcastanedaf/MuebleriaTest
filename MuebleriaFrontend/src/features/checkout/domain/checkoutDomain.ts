// features/checkout/domain/checkoutDomain.ts
export type CheckoutStep = "review" | "payment" | "success";
export type PaymentMethod = "card" | "transfer";

export interface CardData { number: string; name: string; expiry: string; cvv: string; }

export function validateCard(c: CardData) {
  const errors: Record<string,string> = {};
  if (c.number.replace(/\s/g,"").length < 16) errors.number = "Número de tarjeta inválido";
  if (c.name.trim().length < 5)               errors.name   = "Nombre de tarjeta completo";
  if (!/^\d{2}\/\d{2}$/.test(c.expiry))      errors.expiry = "Formato MM/AA";
  if (c.cvv.length < 3)                       errors.cvv    = "CVV inválido";
  return { valid: Object.keys(errors).length === 0, errors };
}

// features/checkout/data/checkoutRepository.ts
import { apiClient } from "../../../core/api/apiClient";
import { handleApiError } from "../../../core/errors/AppError";
import type { CheckoutPayload, OrderDetail, OrderResult } from "../../../core/types";

export const checkoutRepository = {
  async createOrder(payload: CheckoutPayload): Promise<OrderResult> {
    try { return await apiClient.post<OrderResult>("/ordenes-venta", payload); }
    catch(e) { throw handleApiError(e); }
  },
  async getMyOrders(clienteId: number): Promise<OrderResult[]> {
    try {
      const r = await apiClient.get<{ data: OrderResult[] }>(`/ordenes-venta/cliente/${clienteId}`);
      return r.data ?? [];
    } catch(e) { throw handleApiError(e); }
  },
  async getOrderById(id: number): Promise<OrderDetail> {
    try { return await apiClient.get<OrderDetail>(`/ordenes-venta/${id}`); }
    catch(e) { throw handleApiError(e); }
  },
};
