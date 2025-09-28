import axios from "axios";
import Constants from "expo-constants";
import { Storage } from "../utils/storage";
import { API_BASE } from "../config/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (cfg) => {
    const token = await Storage.getItem("jwt");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Add response interceptor to handle non-JSON responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("🚨 API Error:", error.response?.status, error.response?.data);
        
        // If we get HTML instead of JSON, it means the backend isn't running or endpoint doesn't exist
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
            console.error("❌ Backend returned HTML instead of JSON. Is the backend running?");
            error.message = "Backend server is not responding properly. Please check if the backend is running.";
        }
        
        return Promise.reject(error);
    }
);

export default api;
