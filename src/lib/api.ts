import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";
import { useOrganizationStore } from "@/app/store/organization.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Adjust base URL as needed
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const orgId = useOrganizationStore.getState().currentOrganization?.id;

  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, { 
    hasToken: !!token,
    orgId 
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (orgId) {
    config.headers["X-Organization-Id"] = orgId;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = data.data;

        useAuthStore.getState().setAuth({
          accessToken,
          isAuthenticated: true,
        });

        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        // Only logout if it's a definitive auth failure (400 or 401)
        // Avoid logout on server restart/network error (err.response being undefined or other statuses)
        if (err.response?.status === 401 || err.response?.status === 400) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
