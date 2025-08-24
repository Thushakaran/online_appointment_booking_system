import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, login } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/VideoBackground";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER", // you can change to PROVIDER when needed
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

    // Clear any previous errors
    dispatch(clearError());
    setValidationErrors({});
    setSuccessMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(register(form));
      if (register.fulfilled.match(result)) {
        // If registration is successful and user is a provider, auto-login and redirect to setup
        if (form.role === "PROVIDER") {
          setSuccessMessage("Registration successful! Logging you in...");

          try {
            // Auto-login the provider
            const loginResult = await dispatch(
              login({
                username: form.username,
                password: form.password,
              })
            );

            if (login.fulfilled.match(loginResult)) {
              setTimeout(() => {
                navigate("/provider-setup");
              }, 1500);
            } else {
              // If auto-login fails, redirect to login page
              setSuccessMessage(
                "Registration successful! Please login to continue."
              );
              setTimeout(() => navigate("/login"), 2000);
            }
          } catch (loginError) {
            // If auto-login fails, redirect to login page
            setSuccessMessage(
              "Registration successful! Please login to continue."
            );
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          // For regular users, show success message and redirect to login
          setSuccessMessage("Registered! You can login now.");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch {
      // Error is now handled in the Redux slice
    }
  };

  // Clear error when component unmounts
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

  return (
    <VideoBackground>
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)] px-4 py-10">
        <form
          onSubmit={submit}
          className="bg-white/20 backdrop-blur-lg border border-white/30 w-full max-w-md p-8 rounded-2xl shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-heading-h2">
            Create an account
          </h2>

          {/* Server Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-400/50 text-green-200 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-center">
                {successMessage}
              </p>
            </div>
          )}

          <div className="mb-4">
            <input
              name="username"
              className={`bg-white/20 backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70 ${
                validationErrors.username
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/30 focus:border-blue-400"
              }`}
              placeholder="Username"
              value={form.username}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.username && (
              <p className="text-red-300 text-xs mt-1 ml-1">
                {validationErrors.username}
              </p>
            )}
          </div>

          <div className="mb-4">
            <input
              name="email"
              className={`bg-white/20 backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70 ${
                validationErrors.email
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/30 focus:border-blue-400"
              }`}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="text-red-300 text-xs mt-1 ml-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <input
              name="password"
              className={`bg-white/20 backdrop-blur-sm border-2 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70 ${
                validationErrors.password
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/30 focus:border-blue-400"
              }`}
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="text-red-300 text-xs mt-1 ml-1">
                {validationErrors.password}
              </p>
            )}
          </div>

          <label className="text-sm text-white/80 mb-2 block">
            I want to register as:
          </label>
          <select
            name="role"
            className="bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full mb-6 outline-none transition-all duration-300 text-white"
            value={form.role}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="USER" className="bg-gray-800">
              👤 User (Book appointments)
            </option>
            <option value="PROVIDER" className="bg-gray-800">
              🏥 Provider (Offer services)
            </option>
            <option value="ADMIN" className="bg-gray-800">
              🔧 Admin (System management)
            </option>
          </select>

          {form.role === "PROVIDER" && (
            <div className="bg-blue-500/20 border border-blue-400/50 text-blue-200 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-center">
                🎉 Great choice! After registration, you'll be automatically
                logged in and redirected to complete your provider profile
                setup.
              </p>
            </div>
          )}

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
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </VideoBackground>
  );
}
