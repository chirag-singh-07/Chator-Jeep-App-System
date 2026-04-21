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

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("delivery-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("delivery-token");
    }
    return Promise.reject(error);
  }
);
