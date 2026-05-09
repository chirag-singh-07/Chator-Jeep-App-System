import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20s – covers Render free-tier cold-start wake-up time
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

    // Auto-retry ONCE on network errors (Render cold-start)
    const isNetworkError = !status && (error.code === "ECONNABORTED" || error.message === "Network Error");
    if (isNetworkError && !originalRequest._retried) {
      originalRequest._retried = true;
      console.warn(`🔄 [API Retry] Server waking up. Retrying in 3s: ${originalRequest.url}`);
      await new Promise((r) => setTimeout(r, 3000));
      return api(originalRequest);
    }

    // LOG: Warn for non-401 errors
    if (status !== 401) {
      console.warn(
        `⚠️ [API Error] ${status || "Network/Timeout"} ${originalRequest?.url}`,
        { message: error.message, code: error.code, data: error.response?.data }
      );
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if the request is marked as silent (e.g. background tasks)
      if (originalRequest.headers['x-silent']) {
        return Promise.reject(error);
      }

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
