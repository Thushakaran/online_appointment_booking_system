import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiClock,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    dispatch(clearError());
    setValidationErrors({});
    if (!validateForm()) return;

    try {
      await dispatch(login(form));
    } catch {
      // Handled by authSlice
    }
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

  // Preserve exact role-based post-login redirect logic
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
    <AppShell forcePublicShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Left Panel: Context */}
          <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-10">
            <div>
              <p className="text-xs font-medium text-indigo-300 mb-3">
                AppointFlow Platform
              </p>
              <h1 className="text-3xl font-display font-bold leading-tight text-balance mb-4">
                Sign in to manage your schedule and appointments
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                Access real-time provider availability, confirm upcoming sessions, and manage your booking history from one unified workspace.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <FiCalendar className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">Real-time slot booking</div>
                  <div className="text-xs text-slate-400">
                    Browse live provider calendars with instant confirmation.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">Clear status tracking</div>
                  <div className="text-xs text-slate-400">
                    Follow every booking from pending request to completion.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiShield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">Role-based workspaces</div>
                  <div className="text-xs text-slate-400">
                    Dedicated views for clients, service providers, and admins.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access your account.
              </p>
            </div>

            <FeedbackBanner
              variant="error"
              message={error}
              onDismiss={() => dispatch(clearError())}
              className="mb-6"
            />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    validationErrors.username ? "border-rose-400" : "border-slate-300"
                  }`}
                />
                {validationErrors.username && (
                  <p className="text-xs text-rose-600 mt-1.5">
                    {validationErrors.username}
                  </p>
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
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                      validationErrors.password ? "border-rose-400" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-rose-600 mt-1.5">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
