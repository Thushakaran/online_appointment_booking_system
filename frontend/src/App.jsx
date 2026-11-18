import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderSetup from "./pages/ProviderSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProviderManagement from "./pages/AdminProviderManagement";
import Providers from "./pages/Providers";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointment";
import Profile from "./pages/Profile";

const ADMIN_PROVIDER_ROUTES = [
  "/provider-dashboard",
  "/provider-setup",
  "/admin-dashboard",
  "/admin/providers",
];

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
  const { token, role } = useSelector((state) => state.auth);
  const isWorkspaceRoute =
    ADMIN_PROVIDER_ROUTES.some((prefix) =>
      location.pathname.startsWith(prefix)
    ) ||
    (Boolean(token) &&
      role === "PROVIDER" &&
      location.pathname.startsWith("/profile")) ||
    (Boolean(token) &&
      role === "ADMIN" &&
      location.pathname.startsWith("/providers"));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isWorkspaceRoute && <Navbar />}
      <div className="flex-1">
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
      </div>
      {!isWorkspaceRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
