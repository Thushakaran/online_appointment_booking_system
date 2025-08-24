import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// -------------------
// Async Thunks
// -------------------

// Login
export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/auth/login", credentials);
            // Expected response: { id, username, role, token }
            const { id, username, role, token } = res.data;

            // Save to localStorage
            localStorage.setItem("userId", id);
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);
            localStorage.setItem("token", token);

            return { id, username, role, token };
        } catch (error) {
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.error || "Login failed. Please try again.";
                return rejectWithValue(errorMessage);
            } else if (error.request) {
                // Network error
                return rejectWithValue("Network error. Please check your connection.");
            } else {
                // Other errors
                return rejectWithValue("An unexpected error occurred. Please try again.");
            }
        }
    }
);

// Register
export const register = createAsyncThunk(
    "auth/register",
    async (user, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/auth/register", user);
            return res.data;
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.error || "Registration failed. Please try again.";
                return rejectWithValue(errorMessage);
            } else if (error.request) {
                return rejectWithValue("Network error. Please check your connection.");
            } else {
                return rejectWithValue("An unexpected error occurred. Please try again.");
            }
        }
    }
);

// -------------------
// Slice
// -------------------
const authSlice = createSlice({
    name: "auth",
    initialState: {
        userId: localStorage.getItem("userId") || null,
        user: localStorage.getItem("username") || null,
        role: localStorage.getItem("role") || null,
        token: localStorage.getItem("token") || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.userId = null;
            state.user = null;
            state.role = null;
            state.token = null;
            state.error = null;

            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            localStorage.removeItem("token");
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            if (action.payload.username) {
                state.user = action.payload.username;
                localStorage.setItem("username", action.payload.username);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.userId = action.payload.id;
                state.user = action.payload.username;
                state.role = action.payload.role;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
