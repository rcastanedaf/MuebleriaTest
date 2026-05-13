// core/errors/AppError.ts
export interface ApiErrorPayload {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly data?: Record<string, unknown>;
  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "AppError";
    this.status = payload.status;
    this.data = payload.data;
  }
  get isUnauthorized() { return this.status === 401; }
  get isForbidden()    { return this.status === 403; }
  get isNotFound()     { return this.status === 404; }
  get isServerError()  { return this.status >= 500; }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (typeof error === "object" && error !== null && "status" in error && "message" in error) {
    return new AppError(error as ApiErrorPayload);
  }
  return new AppError({ status: 0, message: "Error de conexión. Verifique su red." });
}
