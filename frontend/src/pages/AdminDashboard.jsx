import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import dayjs from "dayjs";
import Pagination from "../components/Pagination";
import videoBackground from "../assets/video.mp4";

export default function AdminDashboard() {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state for users
  const [usersPage, setUsersPage] = useState(0);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [usersTotalElements, setUsersTotalElements] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersHasNext, setUsersHasNext] = useState(false);
  const [usersHasPrevious, setUsersHasPrevious] = useState(false);

  // Pagination state for providers
  const [providersPage, setProvidersPage] = useState(0);
  const [providersPageSize, setProvidersPageSize] = useState(10);
  const [providersTotalElements, setProvidersTotalElements] = useState(0);
  const [providersTotalPages, setProvidersTotalPages] = useState(0);
  const [providersHasNext, setProvidersHasNext] = useState(false);
  const [providersHasPrevious, setProvidersHasPrevious] = useState(false);

  // Pagination state for appointments
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const [appointmentsPageSize, setAppointmentsPageSize] = useState(10);
  const [appointmentsTotalElements, setAppointmentsTotalElements] = useState(0);
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(0);
  const [appointmentsHasNext, setAppointmentsHasNext] = useState(false);
  const [appointmentsHasPrevious, setAppointmentsHasPrevious] = useState(false);

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
        api.get(`/api/users/paginated?page=${usersPage}&size=${usersPageSize}`),
        api.get(
          `/api/providers/paginated?page=${providersPage}&size=${providersPageSize}`
        ),
        api.get(
          `/api/appointments/paginated?page=${appointmentsPage}&size=${appointmentsPageSize}`
        ),
      ]);

      // Set users data
      setUsers(usersRes.data.content || []);
      setUsersTotalElements(usersRes.data.totalElements || 0);
      setUsersTotalPages(usersRes.data.totalPages || 0);
      setUsersHasNext(usersRes.data.hasNext || false);
      setUsersHasPrevious(usersRes.data.hasPrevious || false);

      // Set providers data
      setProviders(providersRes.data.content || []);
      setProvidersTotalElements(providersRes.data.totalElements || 0);
      setProvidersTotalPages(providersRes.data.totalPages || 0);
      setProvidersHasNext(providersRes.data.hasNext || false);
      setProvidersHasPrevious(providersRes.data.hasPrevious || false);

      // Set appointments data
      setAppointments(appointmentsRes.data.content || []);
      setAppointmentsTotalElements(appointmentsRes.data.totalElements || 0);
      setAppointmentsTotalPages(appointmentsRes.data.totalPages || 0);
      setAppointmentsHasNext(appointmentsRes.data.hasNext || false);
      setAppointmentsHasPrevious(appointmentsRes.data.hasPrevious || false);

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
  }, [
    token,
    usersPage,
    usersPageSize,
    providersPage,
    providersPageSize,
    appointmentsPage,
    appointmentsPageSize,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  const deleteProvider = async (providerId) => {
    try {
      await api.delete(`/api/providers/${providerId}`);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error(err);
      setError("Failed to delete provider");
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await api.delete(`/api/appointments/${appointmentId}`);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error(err);
      setError("Failed to delete appointment");
    }
  };

  // Pagination handlers
  const handleUsersPageChange = (page) => {
    setUsersPage(page);
  };

  const handleProvidersPageChange = (page) => {
    setProvidersPage(page);
  };

  const handleAppointmentsPageChange = (page) => {
    setAppointmentsPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] relative">
      {/* Full Page Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoBackground} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-purple-300">
              {usersTotalElements}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Total Providers
            </h3>
            <p className="text-3xl font-bold text-blue-300">
              {providersTotalElements}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Total Appointments
            </h3>
            <p className="text-3xl font-bold text-green-300">
              {appointmentsTotalElements}
            </p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Users</h2>
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
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={usersPage}
            totalPages={usersTotalPages}
            onPageChange={handleUsersPageChange}
            hasNext={usersHasNext}
            hasPrevious={usersHasPrevious}
            totalElements={usersTotalElements}
            pageSize={usersPageSize}
          />
        </div>

        {/* Providers Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Providers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-3 text-white">Username</th>
                  <th className="text-left p-3 text-white">Service</th>
                  <th className="text-left p-3 text-white">City</th>
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
                    <td className="p-3 text-white">{provider.city}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteProvider(provider.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={providersPage}
            totalPages={providersTotalPages}
            onPageChange={handleProvidersPageChange}
            hasNext={providersHasNext}
            hasPrevious={providersHasPrevious}
            totalElements={providersTotalElements}
            pageSize={providersPageSize}
          />
        </div>

        {/* Appointments Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Appointments
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
                      {appointment.provider?.serviceName}
                    </td>
                    <td className="p-3 text-white">
                      {dayjs(appointment.appointmentDate).format(
                        "MMM DD, YYYY"
                      )}
                    </td>
                    <td className="p-3 text-white">{appointment.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={appointmentsPage}
            totalPages={appointmentsTotalPages}
            onPageChange={handleAppointmentsPageChange}
            hasNext={appointmentsHasNext}
            hasPrevious={appointmentsHasPrevious}
            totalElements={appointmentsTotalElements}
            pageSize={appointmentsPageSize}
          />
        </div>
      </div>
    </div>
  );
}
