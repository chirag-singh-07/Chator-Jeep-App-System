import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Multiple API endpoints for redundancy
const API_ENDPOINTS = [
  "https://api.chatorijeeb.com/api/v1",
  "http://89.116.20.144:5001/api/v1",
  "https://chator-jeep-app-system-api.onrender.com/api/v1",
];

const normalizeUrl = (url: string) => {
  const cleaned = url.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  return cleaned.endsWith("/api/v1") ? cleaned : `${cleaned}/api/v1`;
};

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }
  return normalizeUrl(API_ENDPOINTS[0]);
};

// Fallback URLs for when primary fails
export const FALLBACK_API_URLS = API_ENDPOINTS.map(normalizeUrl);

export const API_URL = getBaseUrl();
console.log("🌐 [API Config] Base URL initialized as:", API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading token from storage", e);
    }

    // LOG: Request details
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.params || "", config.data || "");

    return config;
  },
  (error) => {
    console.error("❌ [API Request Config Error]", error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    // LOG: Success details
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const config = error.config;

    // Try fallback URLs on network errors
    const isNetworkError = !status && (error.code === "ECONNABORTED" || error.message === "Network Error");
    if (isNetworkError && config && !config._fallbackTried) {
      for (const fallbackUrl of FALLBACK_API_URLS) {
        if (fallbackUrl !== config.baseURL) {
          config._fallbackTried = true;
          const originalBaseURL = config.baseURL;
          config.baseURL = fallbackUrl;
          console.warn(`🔄 [API Fallback] Trying: ${fallbackUrl}`);
          try {
            return await apiClient(config);
          } catch (retryError) {
            console.warn(`❌ [API Fallback Failed] ${fallbackUrl}`);
            config.baseURL = originalBaseURL;
            continue;
          }
        }
      }
    }

    // Auto-retry ONCE on network errors (cold-start wake-up)
    if (isNetworkError && !config?._retried && config) {
      config._retried = true;
      console.warn(`🔄 [API Retry] Server waking up. Retrying in 3s: ${config.url}`);
      await new Promise((r) => setTimeout(r, 3000));
      return apiClient(config);
    }

    console.warn(
      `⚠️ [API Error] ${status || "Network/Timeout"} ${config?.url}`,
      {
        message: error.message,
        data: error.response?.data,
        code: error.code,
        baseURL: config?.baseURL
      }
    );

    const isLoginRequest = config?.url?.includes("/restaurants/login");
    if (status === 401 && !isLoginRequest) {
      await AsyncStorage.removeItem("token");
      try {
        const { useAuthStore } = require('../store/useAuthStore');
        useAuthStore.getState().logout();
      } catch (e) {
        console.warn('Could not trigger logout from interceptor', e);
      }
    }
    return Promise.reject(error);
  },
);