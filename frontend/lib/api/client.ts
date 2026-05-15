"use client";

const DEFAULT_BASE_URL = "http://localhost:3000";

export type ApiClientOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** Request timeout in ms (default 120s for AI endpoints) */
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("accessToken");
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function unwrapApiEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const token = getAccessToken();
  const timeoutMs = options.timeoutMs ?? 120000;
  const fetchInit: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  let response: Response;
  try {
    response = await fetchWithTimeout(`${getBaseUrl()}${path}`, fetchInit, timeoutMs);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Yêu cầu quá thời gian chờ. AI có thể đang xử lý — thử lại sau.", 408);
    }
    throw new ApiError(
      "Không kết nối được máy chủ. Kiểm tra API Gateway (port 3000) và các service đang chạy.",
      0,
    );
  }

  if (response.status === 401) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    if (refreshToken && path !== "/api/auth/refresh") {
      const refreshResponse = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshed = unwrapApiEnvelope<{ accessToken: string; refreshToken: string }>(
          await refreshResponse.json()
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", refreshed.accessToken);
          localStorage.setItem("refreshToken", refreshed.refreshToken);
        }

        response = await fetchWithTimeout(
          `${getBaseUrl()}${path}`,
          {
            method: options.method || "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshed.accessToken}`,
              ...(options.headers || {}),
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          },
          timeoutMs,
        );
      }
    }

    if (response.status === 401) {
      clearAuthTokens();
      throw new ApiError("Unauthorized. Please login again.", 401);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || "Request failed", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return unwrapApiEnvelope<T>(await response.json());
}
