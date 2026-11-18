import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/ToastProvider";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";

const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const ProviderSetup = lazy(() => import("./pages/ProviderSetup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProviderManagement = lazy(() => import("./pages/AdminProviderManagement"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const Appointments = lazy(() => import("./pages/Appointment"));
const Profile = lazy(() => import("./pages/Profile"));

const ADMIN_PROVIDER_ROUTES = [
  "/provider-dashboard",
  "/provider-setup",
  "/admin-dashboard",
  "/admin/providers",
];

function RouteLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
        <span className="text-xs font-medium text-slate-500">Loading workspace...</span>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center">
        <p className="text-xs font-mono font-semibold text-indigo-600 uppercase tracking-wider">
          404
        </p>
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/providers"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Browse Providers
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  const isWorkspaceRoute =
    ADMIN_PROVIDER_ROUTES.some((prefix) =>
      location.pathname.startsWith(prefix)
    ) ||
    (Boolean(token) &&
      (role === "PROVIDER" || role === "ADMIN") &&
      location.pathname.startsWith("/profile")) ||
    (Boolean(token) &&
      role === "ADMIN" &&
      location.pathname.startsWith("/providers"));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isWorkspaceRoute && <Navbar />}
      <div className="flex-1">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/providers" element={<Providers />} />
            <Route
              path="/book-appointment/:providerId"
              element={<BookAppointment />}
            />

            {/* User-protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["USER", "PROVIDER", "ADMIN"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Provider-protected routes */}
            <Route
              path="/provider-setup"
              element={
                <ProtectedRoute allowedRoles={["PROVIDER"]}>
                  <ProviderSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider-dashboard"
              element={
                <ProtectedRoute allowedRoles={["PROVIDER"]}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin-protected routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/providers"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminProviderManagement />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      {!isWorkspaceRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
