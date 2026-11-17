import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

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

function NotFoundPage() {
  return (
    <AppShell title="Page Not Found">
      <div className="max-w-lg mx-auto my-16 bg-white border border-slate-200 rounded-xl p-10 text-center">
        <p className="text-sm font-mono font-medium text-indigo-600 mb-2">404</p>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to overview
        </Link>
      </div>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
