import axios from "axios"

export const Server = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
})

Server.interceptors.request.use(async (config) => {
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
}, (error) => {
    return Promise.reject(error);
});