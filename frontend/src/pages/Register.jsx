import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiUser,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheck,
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
  const [showPassword, setShowPassword] = useState(false);
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
          setSuccessMessage("Account created. Signing you in to complete provider setup...");
          try {
            const loginResult = await dispatch(
              login({
                username: form.username,
                password: form.password,
              })
            );
            if (login.fulfilled.match(loginResult)) {
              setTimeout(() => {
                navigate("/provider-setup");
              }, 1200);
            } else {
              setSuccessMessage("Registration successful. Please sign in to continue.");
              setTimeout(() => navigate("/login"), 1800);
            }
          } catch {
            setSuccessMessage("Registration successful. Please sign in to continue.");
            setTimeout(() => navigate("/login"), 1800);
          }
        } else {
          setSuccessMessage("Account registered. Redirecting to sign in...");
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    } catch {
      // Error handled in authSlice
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
    <AppShell forcePublicShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Left Panel */}
          <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-10">
            <div>
              <p className="text-xs font-medium text-indigo-300 mb-3">
                Get started with AppointFlow
              </p>
              <h1 className="text-3xl font-display font-bold leading-tight text-balance mb-4">
                Built for effortless scheduling and client trust
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                Choose a client account to discover verified providers and book slots, or register as a service provider to publish your availability.
              </p>
            </div>

            <ul className="space-y-3 pt-8 border-t border-slate-800 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant booking and status notifications</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flexible time-slot management for providers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secure JWT-authenticated account controls</span>
              </li>
            </ul>
          </div>

          {/* Right Panel: Form */}
          <div className="p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Create an account
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your account type and enter your details below.
              </p>
            </div>

            <FeedbackBanner
              variant="error"
              message={error}
              onDismiss={() => dispatch(clearError())}
              className="mb-5"
            />
            <FeedbackBanner
              variant="success"
              message={successMessage}
              className="mb-5"
            />

            <form onSubmit={submit} className="space-y-4" noValidate>
              {/* Role Selection */}
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Account type
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setForm({ ...form, role: "USER" })}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                      form.role === "USER"
                        ? "border-indigo-600 bg-indigo-50/70 text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <FiUser
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        form.role === "USER" ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold">Client</div>
                      <div className="text-xs text-slate-500">Book services</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setForm({ ...form, role: "PROVIDER" })}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                      form.role === "PROVIDER"
                        ? "border-indigo-600 bg-indigo-50/70 text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <FiBriefcase
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        form.role === "PROVIDER" ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold">Provider</div>
                      <div className="text-xs text-slate-500">Offer services</div>
                    </div>
                  </button>
                </div>
              </div>

              {form.role === "PROVIDER" && (
                <FeedbackBanner
                  variant="info"
                  message="After registration, you will be signed in automatically to complete your provider profile setup."
                />
              )}

              <div>
                <label
                  htmlFor="reg-username"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    validationErrors.username ? "border-rose-400" : "border-slate-300"
                  }`}
                />
                {validationErrors.username && (
                  <p className="text-xs text-rose-600 mt-1">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    validationErrors.email ? "border-rose-400" : "border-slate-300"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">
                    {validationErrors.email}
                  </p>
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
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
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
                  <p className="text-xs text-rose-600 mt-1">
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
