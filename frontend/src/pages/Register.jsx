import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const errors = {};
    if (!form.username.trim()) {
      errors.username = "Username is required";
    }
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!form.password.trim()) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setValidationErrors({});
    setSuccessMessage("");
    if (!validateForm()) return;

    try {
      const result = await dispatch(register(form));
      if (register.fulfilled.match(result)) {
        if (form.role === "PROVIDER") {
          setSuccessMessage("Account created. Signing you in for service setup...");
          try {
            const loginResult = await dispatch(
              login({ username: form.username, password: form.password })
            );
            if (login.fulfilled.match(loginResult)) {
              setTimeout(() => navigate("/provider-setup"), 1200);
            } else {
              setSuccessMessage("Registration successful. Please sign in to continue.");
              setTimeout(() => navigate("/login"), 1800);
            }
          } catch {
            setSuccessMessage("Registration successful. Please sign in to continue.");
            setTimeout(() => navigate("/login"), 1800);
          }
        } else {
          setSuccessMessage("Account created successfully. Redirecting to sign in...");
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    } catch {
      // handled by Redux slice
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Join as a client to book consultations or as a service provider.
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

        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700"
          >
            <FiCheckCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Segmented Role Selector */}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              Account type
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "USER" })}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  form.role === "USER"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiUser className="w-4 h-4" aria-hidden="true" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "PROVIDER" })}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  form.role === "PROVIDER"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiBriefcase className="w-4 h-4" aria-hidden="true" />
                <span>Provider</span>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-username"
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
                id="reg-username"
                name="username"
                placeholder="Choose a username"
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
              htmlFor="reg-email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <FiMail
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.email
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600"
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-rose-600 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-password"
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
                id="reg-password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.password
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600"
                }`}
              />
            </div>
            {validationErrors.password && (
              <p className="text-rose-600 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {form.role === "PROVIDER" && (
            <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 leading-relaxed">
              After creating your provider account, you will be signed in
              automatically to configure your service details, location, and
              pricing.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
