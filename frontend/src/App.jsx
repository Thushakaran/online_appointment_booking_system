import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";

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

const WORKSPACE_ROUTES = [
  "/dashboard",
  "/appointments",
  "/profile",
  "/provider-dashboard",
  "/provider-setup",
  "/admin-dashboard",
  "/admin/providers",
];

function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 saas-ambient-canvas">
      <div className="saas-card p-8 sm:p-10 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200/80 text-violet-700 font-mono font-bold text-sm flex items-center justify-center mx-auto">
          404
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-4">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="saas-btn-primary px-4 py-2.5 text-sm"
          >
            Back to Home
          </Link>
          <Link
            to="/providers"
            className="saas-btn-secondary px-4 py-2.5 text-sm"
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
  const isWorkspaceRoute = WORKSPACE_ROUTES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fc]">
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
              <ProtectedRoute allowedRoles={["USER", "PROVIDER"]}>
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
