import { apiRequest } from "@/lib/api/client";
import { AuthResponse, AuthUser } from "@/types/auth";
import { clearTokens, saveTokens } from "@/lib/auth.utils";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function register(payload: RegisterPayload) {
  const response = await apiRequest<ApiEnvelope<AuthResponse>>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
  const auth = response.data;

  // Save tokens after registration
  if (typeof window !== "undefined") {
    saveTokens(auth.accessToken, auth.refreshToken);
  }
  return auth;
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<ApiEnvelope<AuthResponse>>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
  const auth = response.data;

  // Save tokens after login
  if (typeof window !== "undefined") {
    saveTokens(auth.accessToken, auth.refreshToken);
  }
  return auth;
}

export async function logout() {
  try {
    // Call logout endpoint to revoke refresh token on backend
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (refreshToken) {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    // Always clear tokens locally regardless of backend response
    clearTokens();
  }
}

export async function getCurrentUser() {
  const response = await apiRequest<ApiEnvelope<AuthUser>>("/api/auth/profile");
  return response.data;
}

export async function updateProfile(payload: { fullName?: string; avatarUrl?: string }) {
  const response = await apiRequest<ApiEnvelope<AuthUser>>("/api/auth/profile", {
    method: "PUT",
    body: payload,
  });
  return response.data;
}
