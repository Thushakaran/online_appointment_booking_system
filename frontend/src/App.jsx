import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
