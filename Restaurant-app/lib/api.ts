import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl}/api/v1`;
  }
  return Platform.select({
    ios: "http://localhost:5000/api/v1",
    android: "http://10.0.2.2:5000/api/v1",
    default: "http://localhost:5000/api/v1",
  });
};

export const API_URL = getBaseUrl();
console.log("🌐 [API Config] Base URL initialized as:", API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20s – covers Render free-tier cold-start wake-up
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

    // Auto-retry ONCE on network errors (Render cold-start wake-up)
    const isNetworkError = !status && (error.code === "ECONNABORTED" || error.message === "Network Error");
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

    if (status === 401) {
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
