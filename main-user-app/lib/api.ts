import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // LOG: Request details
  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || "", config.data || "");
  
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

    // LOG: Warn instead of Error to avoid red screen for handled cases
    if (status !== 401) {
      console.warn(
        `⚠️ [API Error] ${status || "Network/Timeout"} ${error.config?.url}`, 
        error.response?.data || error.message
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
