import api from "@/lib/api";
import { ApiResponse, LoginResponse, RegisterResponse, RegisterPayload, User, AuthTokens } from "@/types/auth";

export const authService = {
  login: async (data: any) => {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return response.data.data;
  },
  
  register: async (data: RegisterPayload) => {
    const response = await api.post<ApiResponse<RegisterResponse>>("/auth/register", data);
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/users/me");
    return response.data.data;
  },

  updateMe: async (data: any) => {
    const response = await api.patch<ApiResponse<User>>("/users/me", data);
    return response.data.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh");
    return response.data.data;
  },

  updatePassword: async (data: any) => {
    const response = await api.patch<ApiResponse<any>>("/auth/password", data);
    return response.data;
  },
};
