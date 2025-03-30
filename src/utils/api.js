import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            sessionStorage.removeItem("token"); 
            // window.location.href = "/auth/login";
        }
        const message = error.response?.data?.error || "An unexpected error occurred.";
        return Promise.reject(error);
    }
);

export default api;
