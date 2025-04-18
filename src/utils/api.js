import axios from "axios";

const API_BASE_URL = window.runtimeConfig?.REACT_APP_API_BASE_URL;
// console.log("API Base URL:", API_BASE_URL);
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
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
