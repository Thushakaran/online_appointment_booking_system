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
            if (status === 401) {
                console.log(`Authentication error (${status}):`, error.response.data);
                // Token is invalid or expired
                // Clear localStorage and redirect to login page
                localStorage.removeItem("userId");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                localStorage.removeItem("token");
                // Redirect to login page
                window.location.href = "/";
            } else if (status === 403) {
                console.log(`Authorization error (${status}):`, error.response.data);
                // User doesn't have permission for this specific action
                // Don't clear authentication, just reject the promise
                // This allows the calling code to handle the error appropriately
                // Don't redirect - let the component handle it
            }
        }
        return Promise.reject(error);
    }
);

export default api;
