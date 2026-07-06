export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: string | null;
  avatar: string | null;
  googleId: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  avatar?: string;
}

export interface AuthTokens {
}

export interface LoginResponse {
  csrfToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  isVerified: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
}
