import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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

export const getSocketUrl = () => API_URL.replace(/\/api\/v1$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20s – enough time for a Render cold-start wake-up
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("delivery-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // LOG: Full URL + payload
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.data || "");
    
    return config;
  },
  (error) => {
    console.error("❌ [API Request Config Error]", error);
    return Promise.reject(error);
  }
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

    // Auto-retry once on network errors (Render cold-start wake-up)
    const isNetworkError = !status && (error.code === "ECONNABORTED" || error.message === "Network Error");
    const hasNotRetried = !config?._retried;

    if (isNetworkError && hasNotRetried && config) {
      config._retried = true;
      console.warn(`🔄 [API Retry] Server may be waking up. Retrying in 3s: ${config.url}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiClient(config);
    }

    // LOG: Error details
    console.warn(
      `⚠️ [API Error] ${status || "Network/Timeout"} ${config?.url}`,
      { message: error.message, code: error.code, data: error.response?.data }
    );

    if (status === 401) {
      await AsyncStorage.removeItem("delivery-token");
    }
    return Promise.reject(error);
  }
);
