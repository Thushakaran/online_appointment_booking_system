import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import dayjs from "dayjs";
import VideoBackground from "../components/VideoBackground";

export default function AdminDashboard() {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (role !== "ADMIN") {
      navigate("/");
    }
  }, [token, role, navigate]);

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [usersRes, providersRes, appointmentsRes] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/providers"),
        api.get("/api/appointments"),
      ]);
      setUsers(usersRes.data || []);
      setProviders(providersRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch admin data. Make sure you are logged in as admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/api/users/${userId}`);
        fetchAdminData(); // Refresh data
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  const deleteProvider = async (providerId) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      try {
        await api.delete(`/api/providers/${providerId}`);
        fetchAdminData(); // Refresh data
      } catch (err) {
        setError("Failed to delete provider");
      }
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await api.delete(`/api/appointments/${appointmentId}`);
        fetchAdminData(); // Refresh data
      } catch (err) {
        setError("Failed to delete appointment");
      }
    }
  };

  if (loading)
    return (
      <VideoBackground>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </VideoBackground>
    );

  return (
    <VideoBackground>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-heading-h1">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin/providers")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Manage Providers
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <p className="text-red-400 mb-4 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
            {error}
          </p>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-6 rounded-2xl hover:bg-white/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-heading-h3 mb-2">
              Total Users
            </h3>
            <p className="text-4xl font-bold text-blue-400">{users.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-6 rounded-2xl hover:bg-white/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-heading-h3 mb-2">
              Total Providers
            </h3>
            <p className="text-4xl font-bold text-green-400">
              {providers.length}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-6 rounded-2xl hover:bg-white/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-heading-h3 mb-2">
              Total Appointments
            </h3>
            <p className="text-4xl font-bold text-purple-400">
              {appointments.length}
            </p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-heading-h2">
            Users Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-3 text-white">Username</th>
                  <th className="text-left p-3 text-white">Email</th>
                  <th className="text-left p-3 text-white">Role</th>
                  <th className="text-left p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/20">
                    <td className="p-3 text-white">{user.username}</td>
                    <td className="p-3 text-white">{user.email}</td>
                    <td className="p-3 text-white">{user.role}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Providers Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-heading-h2">
            Providers Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-3 text-white">Username</th>
                  <th className="text-left p-3 text-white">Service Name</th>
                  <th className="text-left p-3 text-white">Description</th>
                  <th className="text-left p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-t border-white/20">
                    <td className="p-3 text-white">
                      {provider.user?.username}
                    </td>
                    <td className="p-3 text-white">{provider.serviceName}</td>
                    <td className="p-3 text-white">{provider.description}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteProvider(provider.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-heading-h2">
            Appointments Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-3 text-white">User</th>
                  <th className="text-left p-3 text-white">Provider</th>
                  <th className="text-left p-3 text-white">Date</th>
                  <th className="text-left p-3 text-white">Status</th>
                  <th className="text-left p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-white/20">
                    <td className="p-3 text-white">
                      {appointment.user?.username}
                    </td>
                    <td className="p-3 text-white">
                      {appointment.provider?.user?.username}
                    </td>
                    <td className="p-3 text-white">
                      {appointment.appointmentDate
                        ? dayjs(appointment.appointmentDate).format(
                            "YYYY-MM-DD HH:mm"
                          )
                        : "N/A"}
                    </td>
                    <td className="p-3 text-white">{appointment.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
