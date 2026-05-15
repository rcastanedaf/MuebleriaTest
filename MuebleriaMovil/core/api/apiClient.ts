import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Cambia esta URL cada vez que reinicias ngrok ──────────────
// Comando para levantar el túnel: ngrok http 56936
export const API_BASE_URL = "https://PEGA-AQUI-TU-URL.ngrok-free.app/api";
// ──────────────────────────────────────────────────────────────

const TOKEN_KEY = "alpes_token";

export const tokenStorage = {
  get:   ()            => AsyncStorage.getItem(TOKEN_KEY),
  set:   (t: string)   => AsyncStorage.setItem(TOKEN_KEY, t),
  clear: ()            => AsyncStorage.removeItem(TOKEN_KEY),
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  if (requiresAuth) {
    const token = await tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw { status: response.status, message: (err as any).message ?? `HTTP ${response.status}` };
  }

  if (response.status === 204) return undefined as unknown as T;
  const text = await response.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export const apiClient = {
  get:    <T>(path: string)                        => request<T>(path, "GET"),
  post:   <T>(path: string, body: unknown, auth = true) => request<T>(path, "POST", body, auth),
  put:    <T>(path: string, body: unknown)         => request<T>(path, "PUT", body),
  delete: <T>(path: string)                        => request<T>(path, "DELETE"),
};
