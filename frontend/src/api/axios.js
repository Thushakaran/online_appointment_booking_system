import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081", // adjust backend port
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

            // Handle authentication errors
            if (status === 401 || status === 403) {
                console.log(`Authentication error (${status}):`, error.response.data);
                // Token is invalid, expired, or user doesn't have permission
                // Clear localStorage and redirect to login page
                localStorage.removeItem("userId");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                localStorage.removeItem("token");
                // Redirect to login page
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
