import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/auth/authSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUser, FiAlertCircle } from "react-icons/fi";
import api from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { role, token, loading, error } = useSelector((state) => state.auth);
  const redirectTarget = location.state?.from;

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
    dispatch(clearError());
    setValidationErrors({});
    if (!validateForm()) return;
    await dispatch(login(form));
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    if (error) dispatch(clearError());
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkProviderProfile = async () => {
      if (token && role === "PROVIDER") {
        try {
          const response = await api.get("/api/providers/me");
          if (response.status === 200) {
            navigate("/provider-dashboard");
          } else {
            navigate("/provider-setup");
          }
        } catch {
          navigate("/provider-setup");
        }
      } else if (token) {
        if (redirectTarget && role === "USER") {
          navigate(redirectTarget);
        } else if (role === "USER") {
          navigate("/dashboard");
        } else if (role === "ADMIN") {
          navigate("/admin-dashboard");
        }
      }
    };

    if (token) {
      checkProviderProfile();
    }
  }, [role, token, navigate, redirectTarget]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Sign in to AppointFlow
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Access your appointments, schedule, or administrative workspace.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"
          >
            <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <FiUser
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="login-username"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.username
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600"
                }`}
              />
            </div>
            {validationErrors.username && (
              <p className="text-rose-600 text-xs mt-1">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <FiLock
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.password
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-rose-600 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to AppointFlow?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
