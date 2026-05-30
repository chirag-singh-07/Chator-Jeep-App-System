import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { Platform } from "react-native";

// Multiple API endpoints for redundancy
const API_ENDPOINTS = [
  "https://api.chatorijeeb.com/api/v1",
  "http://89.116.20.144:5001/api/v1",
  "https://chator-jeep-app-system-api.onrender.com/api/v1",
];

const normalizeApiUrl = (url: string) => {
  const cleaned = url.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  return cleaned.endsWith("/api/v1") ? cleaned : `${cleaned}/api/v1`;
};

const getLocalApiUrl = () =>
  Platform.select({
    android: "http://10.0.2.2:5001/api/v1",
    ios: "http://localhost:5001/api/v1",
    default: "http://localhost:5001/api/v1",
  })!;

// Use environment variable if set, otherwise use primary endpoint
const getPrimaryApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  }
  return normalizeApiUrl(API_ENDPOINTS[0]);
};

// Current active endpoint (for fallback logic)
let currentEndpointIndex = 0;

export const API_URL = getPrimaryApiUrl();
export const SOCKET_URL = API_URL.replace(/\/api\/v1$/, "");
export const LOCAL_API_URL = getLocalApiUrl();

// Fallback URLs for when primary fails
export const FALLBACK_API_URLS = API_ENDPOINTS.map(normalizeApiUrl);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  adapter: "fetch",
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // LOG: Full URL + payload
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.data || "");

  return config;
}, (error) => {
  console.error("❌ [API Request Config Error]", error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    // LOG: Success details
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    // Try fallback URLs on network errors
    const isNetworkError = !status && (error.code === "ECONNABORTED" || error.message === "Network Error");
    if (isNetworkError && originalRequest && !originalRequest._fallbackTried) {
      // Try next fallback URL
      for (let i = 1; i < FALLBACK_API_URLS.length; i++) {
        const fallbackUrl = FALLBACK_API_URLS[i];
        if (fallbackUrl !== originalRequest.baseURL) {
          originalRequest._fallbackTried = true;
          originalRequest.baseURL = fallbackUrl;
          console.warn(`🔄 [API Fallback] Trying: ${fallbackUrl}`);
          try {
            return await api(originalRequest);
          } catch (retryError) {
            console.warn(`❌ [API Fallback Failed] ${fallbackUrl}`);
            continue;
          }
        }
      }
    }

    // Auto-retry ONCE on network errors (cold-start)
    if (isNetworkError && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      console.warn(`🔄 [API Retry] Server waking up. Retrying in 8s: ${originalRequest.url}`);
      await new Promise((r) => setTimeout(r, 8000));
      return api(originalRequest);
    }

    // LOG: Warn for non-401 errors
    if (status !== 401) {
      console.warn(
        `⚠️ [API Error] ${status || "Network/Timeout"} ${originalRequest?.url}`,
        {
          baseURL: originalRequest?.baseURL,
          message: error.message,
          code: error.code,
          data: error.response?.data,
        },
      );
    }
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isLoginRequest) {
      const headers = originalRequest.headers || {};
      const isSilentRequest =
        headers["x-silent"] === "true" ||
        headers["X-Silent"] === "true" ||
        headers.get?.("x-silent") === "true";

      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        if (isSilentRequest) {
          return Promise.reject(error);
        }

        // Refresh token expired or invalid
        await useAuthStore.getState().logout();

        // Only redirect if not already in auth group to avoid loops
        router.replace("/(auth)/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;