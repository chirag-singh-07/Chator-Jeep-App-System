import axios from "axios";

// Multiple API endpoints for redundancy
const API_ENDPOINTS = [
  "https://api.chatorijeeb.com/api/v1",
  "http://89.116.20.144:5001/api/v1",
  "https://chator-jeep-app-system-api.onrender.com/api/v1",
];

const normalizeUrl = (url: string) => {
  const cleaned = url.trim().replace(/\/+$/, "");
  return cleaned.endsWith("/api/v1") ? cleaned : `${cleaned}/api/v1`;
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }
  return normalizeUrl(API_ENDPOINTS[0]);
};

// Fallback URLs for when primary fails
export const FALLBACK_API_URLS = API_ENDPOINTS.map(normalizeUrl);

export const API_BASE_URL = getBaseUrl();
console.log("🌐 [API Config] Base URL initialized as:", API_BASE_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { useAuthStore } from "@/stores/useAuthStore";

// Add a response interceptor to handle errors with fallback
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

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

    console.warn(
      `⚠️ [API Error] ${status || "Network/Timeout"} ${config?.url}`,
      { message: error.message, code: error.code }
    );

    const isLoginRequest = config?.url?.includes("/auth/login");
    if (status === 401 && !isLoginRequest) {
      // Handle unauthorized
      localStorage.removeItem("token");
      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);