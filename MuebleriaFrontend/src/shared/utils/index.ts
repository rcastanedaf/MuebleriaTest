// shared/utils/index.ts

export function formatQTZ(n: number): string {
  return `Q ${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("es-GT"); } catch { return iso; }
}
export function initials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("");
}
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type BadgeVariant = "default" | "success" | "danger" | "warning" | "info" | "muted";

const ESTADO_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  A: { label: "Activo",     variant: "success" },
  I: { label: "Inactivo",   variant: "danger"  },
  P: { label: "Pendiente",  variant: "warning" },
  C: { label: "Cerrado",    variant: "muted"   },
  R: { label: "Rechazado",  variant: "danger"  },
  E: { label: "En proceso", variant: "info"    },
  D: { label: "Despachado", variant: "info"    },
  F: { label: "Facturado",  variant: "success" },
  M: { label: "Mant.",      variant: "warning" },
};
export const estadoLabel   = (s: string) => ESTADO_MAP[s]?.label   ?? s;
export const estadoBadge   = (s: string): BadgeVariant => ESTADO_MAP[s]?.variant ?? "default";
