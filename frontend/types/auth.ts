export type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AuthResponse = AuthTokens & {
  user: AuthUser;
};
