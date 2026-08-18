import axios from "axios";

const API_ENDPOINTS = [
  "https://api.chatorijeeb.com/api/v1",
];

const normalizeUrl = (url: string) => {
  const cleaned = url.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  return cleaned.endsWith("/api/v1") ? cleaned : `${cleaned}/api/v1`;
};

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }
  return normalizeUrl(API_ENDPOINTS[0]);
};

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
  (config) => {
    try {
      // In Next.js, localStorage is only available in the browser
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Error reading token from storage", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes("/restaurants/login");
    
    if (status === 401 && !isLoginRequest) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        try {
          const { useAuthStore } = require('../../store/useAuthStore');
          useAuthStore.getState().logout();
        } catch (e) {
          console.warn('Could not trigger logout from interceptor', e);
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
