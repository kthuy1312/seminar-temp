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

export async function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
  }
  return response;
}

export async function getCurrentUser() {
  return apiRequest<AuthUser>("/api/auth/profile");
}

export async function updateProfile(payload: { fullName?: string; avatarUrl?: string }) {
  return apiRequest<AuthUser>("/api/auth/profile", {
    method: "PUT",
    body: payload,
  });
}
