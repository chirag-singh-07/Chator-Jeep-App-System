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
    
    // LOG: Request details
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || "", config.data || "");
    
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
    
    // LOG: Error details
    console.warn(
      `⚠️ [API Error] ${status || "Network/Timeout"} ${error.config?.url}`, 
      error.response?.data || error.message
    );

    if (status === 401) {
      await AsyncStorage.removeItem("delivery-token");
    }
    return Promise.reject(error);
  }
);
