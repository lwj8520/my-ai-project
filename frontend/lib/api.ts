import { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export class ApiFetchError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiFetchError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 204) {
      return null as unknown as T;
    }

    if (!res.ok) {
      let errorData: any = null;
      try {
        errorData = await res.json();
      } catch {
        throw new ApiFetchError(
          "HTTP_ERROR",
          `요청 실패 (상태 코드: ${res.status})`,
          res.status
        );
      }

      if (errorData?.code && errorData?.message) {
        throw new ApiFetchError(errorData.code, errorData.message, res.status);
      }

      if (res.status === 422 && Array.isArray(errorData?.detail)) {
        const firstErr = errorData.detail[0];
        const field = firstErr.loc?.slice(-1)[0] || "입력값";
        const msg = firstErr.msg || "유효하지 않은 값입니다.";
        throw new ApiFetchError(
          "VALIDATION_ERROR",
          `${field}: ${msg}`,
          res.status
        );
      }

      throw new ApiFetchError(
        errorData?.code || "ERROR",
        errorData?.message || "오류가 발생했습니다.",
        res.status
      );
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiFetchError) {
      throw err;
    }
    throw new ApiFetchError(
      "NETWORK_ERROR",
      "서버와의 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
      0
    );
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
