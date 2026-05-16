// core/api/apiClient.ts
// HTTP client — apunta al backend VB.NET + Oracle 21c

export const API_BASE_URL =
  (process.env.REACT_APP_API_URL as string)?.replace(/\/$/, "") ?? "/api";

const TOKEN_KEY   = "alpes_token";
const USER_KEY    = "alpes_user";
const MODULES_KEY = "alpes_modules";

const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const normalizeResponse = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeResponse);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, val]) => {
      acc[toCamel(key)] = normalizeResponse(val);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return value;
};

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export const userStorage = {
  get: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch { return null; }
  },
  set: (value: unknown): void => localStorage.setItem(USER_KEY, JSON.stringify(value)),
  clear: (): void => localStorage.removeItem(USER_KEY),
};

export const modulesStorage = {
  get: (): string[] | null => {
    try {
      const raw = localStorage.getItem(MODULES_KEY);
      if (!raw || raw === "null") return null;
      return JSON.parse(raw) as string[];
    } catch { return null; }
  },
  set: (value: string[] | null): void => localStorage.setItem(MODULES_KEY, JSON.stringify(value)),
  clear: (): void => localStorage.removeItem(MODULES_KEY),
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, requiresAuth = true } = options;
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  }
  const headers: HeadersInit = { "Content-Type": "application/json", Accept: "application/json" };
  if (requiresAuth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw { status: response.status, message: (err as any).message ?? `HTTP ${response.status}`, data: err };
  }
  if (response.status === 204) return undefined as unknown as T;
  const text = await response.text();
  if (!text.trim()) return undefined as unknown as T;
  return normalizeResponse(JSON.parse(text)) as T;
}

export const apiClient = {
  get:    <T>(path: string, params?: Record<string, string | number | boolean>) =>
            request<T>(path, { method: "GET", params }),
  post:   <T>(path: string, body: unknown, requiresAuth = true) =>
            request<T>(path, { method: "POST", body, requiresAuth }),
  put:    <T>(path: string, body: unknown) =>
            request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) =>
            request<T>(path, { method: "DELETE" }),
};

export default apiClient;
