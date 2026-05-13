// features/checkout/hooks/useCheckout.ts
import { useState, useCallback } from "react";
import { checkoutRepository } from "../domain/checkoutDomain";
import { validateCard, type CheckoutStep, type PaymentMethod, type CardData } from "../domain/checkoutDomain";
import { useCart } from "../../cart/hooks/useCart";
import { useAuthStore } from "../../../store/authStore";
import type { OrderResult } from "../../../core/types";

export function useCheckout() {
  const { items, subtotal, tax, total, clear } = useCart();
  const { user } = useAuthStore();
  const [step,        setStep]        = useState<CheckoutStep>("review");
  const [method,      setMethod]      = useState<PaymentMethod>("card");
  const [cardData,    setCardData]    = useState<CardData>({ number:"", name:"", expiry:"", cvv:"" });
  const [cardErrors,  setCardErrors]  = useState<Record<string,string>>({});
  const [loading,     setLoading]     = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  const pay = useCallback(async () => {
    if (method === "card") {
      const v = validateCard(cardData);
      if (!v.valid) { setCardErrors(v.errors); return; }
    }
    setLoading(true); setError(null);
    try {
      const result = await checkoutRepository.createOrder({
        clienteId:   user?.id ?? 0,
        subtotal, impuesto: tax, total, metodoPago: method,
        descripcion: items.map(i => `${i.qty}x ${i.nombreArticulo}`).join(", "),
        items: items.map(i => ({ articuloId: i.idArticulo, cantidad: i.qty, precioUnitario: i.precio })),
      });
      setOrderResult(result);
      clear();
      setStep("success");
    } catch(e: any) {
      setError(e.message ?? "Error al procesar el pago");
    } finally { setLoading(false); }
  }, [method, cardData, items, user, subtotal, tax, total, clear]);

  return {
    step, setStep, method, setMethod, cardData, setCardData,
    cardErrors, loading, error, orderResult,
    items, subtotal, tax, total, pay,
  };
}
