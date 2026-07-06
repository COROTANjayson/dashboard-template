import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";
import { useOrganizationStore } from "@/app/store/organization.store";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Adjust base URL as needed
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const orgId = useOrganizationStore.getState().currentOrganization?.id;

  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    orgId,
  });

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
      // Prevent loops on login or refresh endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          // Stamp the queued request so it doesn't loop if it fails again
          originalRequest._retry = true;
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // httpOnly cookies will be sent automatically by the browser.
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
          { withCredentials: true },
        );

        useAuthStore.getState().setAuth({
          isAuthenticated: true,
        });

        // Pass null to the queue (it's ignored by our updated then() block anyway)
        processQueue(null);
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
  },
);

export default api;
