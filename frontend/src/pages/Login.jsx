import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role, token, loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const errors = {};

    if (!form.username.trim()) {
      errors.username = "Username is required";
    }

    if (!form.password.trim()) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    dispatch(clearError());
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login(form));
      // navigation happens after Redux updates
    } catch {
      // Error is now handled in the Redux slice
    }
  };

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear error when user starts typing
  const handleInputChange = (e) => {
    if (error) {
      dispatch(clearError());
    }
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Redirect based on role when token exists
  useEffect(() => {
    const checkProviderProfile = async () => {
      if (token && role === "PROVIDER") {
        try {
          // Check if provider has a profile
          await api.get("/api/providers/me");
          navigate("/provider-dashboard");
        } catch {
          // If provider doesn't have a profile, redirect to setup
          navigate("/provider-setup");
        }
      } else if (token) {
        if (role === "USER") {
          navigate("/dashboard");
        } else if (role === "ADMIN") {
          navigate("/admin-dashboard");
        }
      }
    };

    if (token) {
      checkProviderProfile();
    }
  }, [role, token, navigate]);

  return (
    <VideoBackground>
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)] px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white/20 backdrop-blur-lg border border-white/30 p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center transition-all duration-300 transform hover:scale-105"
        >
          <h2 className="text-3xl font-extrabold mb-6 text-white drop-shadow-md">
            Welcome Back
          </h2>

          {/* Server Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
              <p className="text-red-200 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}

          <div className="w-full mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`bg-white/20 backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70 ${
                validationErrors.username
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/30 focus:border-blue-400"
              }`}
              onChange={handleInputChange}
              value={form.username}
              disabled={loading}
            />
            {validationErrors.username && (
              <p className="text-red-300 text-xs mt-1 ml-1">
                {validationErrors.username}
              </p>
            )}
          </div>

          <div className="w-full mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`bg-white/20 backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70 ${
                validationErrors.password
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/30 focus:border-blue-400"
              }`}
              onChange={handleInputChange}
              value={form.password}
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="text-red-300 text-xs mt-1 ml-1">
                {validationErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </VideoBackground>
  );
}
