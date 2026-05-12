import { apiRequest } from "@/lib/api/client";
import { AuthResponse, AuthUser } from "@/types/auth";

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
  return response.data;
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<ApiEnvelope<AuthResponse>>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
  const auth = response.data;

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", auth.accessToken);
    localStorage.setItem("refreshToken", auth.refreshToken);
  }
  return auth;
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
