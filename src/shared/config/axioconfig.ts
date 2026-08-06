import axios from "axios";
import { navigationRef } from "../lib/navigationref";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "https://multimate-server.vercel.app";

export const Server = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
});

Server.interceptors.request.use(
  async (config) => {
    let token = null;

    if (typeof window !== "undefined") {
      token = await (window as any).api.getToken();
    } else {
      token = process.env.CURRENT_AUTH_TOKEN || null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

Server.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined" && (window as any).api) {
      await (window as any).api.logout();
      if (navigationRef.navigate) {
        navigationRef.navigate("/login", { replace: true });
      } else {
        window.location.hash = "/";
      }
    }

    if (error.response?.status === 429 && typeof window !== "undefined") {
      const retryAfter = error.response.headers?.["retry-after"] || 60;
      const message =
        error.response.data?.message || `Rate limited. Try again in ${retryAfter} seconds.`;
      console.warn(`Rate limited: ${message}`);
    }

    return Promise.reject(error);
  },
);
