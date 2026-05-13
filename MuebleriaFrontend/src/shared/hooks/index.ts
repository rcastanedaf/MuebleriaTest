// shared/hooks/index.ts
import { useState, useCallback, useEffect, createContext, useContext } from "react";

// ── Toast ────────────────────────────────────────────────────
export interface ToastItem { id: number; msg: string; type?: "success" | "error"; }

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const show = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

// ── Debounce ─────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 300): T {
  const [dv, setDv] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Disclosure (modal open/close) ────────────────────────────
export function useDisclosure(init = false) {
  const [isOpen, setIsOpen] = useState(init);
  return {
    isOpen,
    open:   useCallback(() => setIsOpen(true),  []),
    close:  useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen(v => !v), []),
  };
}

// ── i18n / Lang ──────────────────────────────────────────────
export type Lang = "es" | "en" | "fr";
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "es", setLang: () => {},
});
export const useLang = () => useContext(LangCtx);
export { LangCtx };
