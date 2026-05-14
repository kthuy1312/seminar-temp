/**
 * JWT utilities for frontend
 * Decode JWT token and extract user information
 */

export type JwtPayload = {
  sub: string; // user ID
  email: string;
  iat: number; // issued at
  exp: number; // expiration
  [key: string]: any;
};

/**
 * Decode JWT token without verification (frontend only)
 * ⚠️ This is NOT secure - only decode, don't verify signature
 * Verification must be done on backend
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = atob(parts[1]);
    return JSON.parse(payload) as JwtPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get user ID from access token stored in localStorage
 */
export function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  const payload = decodeJwt(token);
  return payload?.sub || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('refreshToken');
}

/**
 * Save tokens to localStorage
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear all auth tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId'); // also clear cached user ID
}
