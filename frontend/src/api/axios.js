import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
});

// Add token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            const requestUrl = error.config?.url || "";

            // Handle authentication errors for non-auth endpoints
            if (status === 401 && !requestUrl.includes("/api/auth/")) {
                localStorage.removeItem("userId");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                localStorage.removeItem("token");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
