// core/api/apiClient.ts
// HTTP client — apunta al backend VB.NET + Oracle 21c

const API_BASE_URL =
  (process.env.REACT_APP_API_URL as string) ?? "https://localhost:56935/api";

const TOKEN_KEY = "alpes_token";

export const tokenStorage = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),
  clear: (): void => sessionStorage.removeItem(TOKEN_KEY),
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
  return response.json() as Promise<T>;
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
