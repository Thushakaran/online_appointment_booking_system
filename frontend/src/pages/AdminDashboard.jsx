import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api/axios";
import { dashboardAPI } from "../api/dashboard";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import Pagination from "../components/Pagination";
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiSearch,
  FiTrash2,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "providers", label: "Providers" },
  { key: "appointments", label: "Appointments" },
];

export default function AdminDashboard() {
  const { token, role, user: currentUsername } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
  });

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & filter state for current page views
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [providerSearch, setProviderSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("ALL");

  // Pagination state for users
  const [usersPage, setUsersPage] = useState(0);
  const [usersPageSize] = useState(10);
  const [usersTotalElements, setUsersTotalElements] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersHasNext, setUsersHasNext] = useState(false);
  const [usersHasPrevious, setUsersHasPrevious] = useState(false);

  // Pagination state for providers
  const [providersPage, setProvidersPage] = useState(0);
  const [providersPageSize] = useState(10);
  const [providersTotalElements, setProvidersTotalElements] = useState(0);
  const [providersTotalPages, setProvidersTotalPages] = useState(0);
  const [providersHasNext, setProvidersHasNext] = useState(false);
  const [providersHasPrevious, setProvidersHasPrevious] = useState(false);

  // Pagination state for appointments
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const [appointmentsPageSize] = useState(10);
  const [appointmentsTotalElements, setAppointmentsTotalElements] = useState(0);
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(0);
  const [appointmentsHasNext, setAppointmentsHasNext] = useState(false);
  const [appointmentsHasPrevious, setAppointmentsHasPrevious] = useState(false);

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, usersRes, providersRes, appointmentsRes] =
        await Promise.all([
          dashboardAPI.getStats().catch(() => null),
          api.get(`/api/users/paginated?page=${usersPage}&size=${usersPageSize}`),
          api.get(
            `/api/providers/paginated?page=${providersPage}&size=${providersPageSize}`
          ),
          api.get(
            `/api/appointments/paginated?page=${appointmentsPage}&size=${appointmentsPageSize}`
          ),
        ]);

      if (statsRes) {
        setPlatformStats(statsRes);
      }

      setUsers(usersRes.data.content || []);
      setUsersTotalElements(usersRes.data.totalElements || 0);
      setUsersTotalPages(usersRes.data.totalPages || 0);
      setUsersHasNext(usersRes.data.hasNext || false);
      setUsersHasPrevious(usersRes.data.hasPrevious || false);

      setProviders(providersRes.data.content || []);
      setProvidersTotalElements(providersRes.data.totalElements || 0);
      setProvidersTotalPages(providersRes.data.totalPages || 0);
      setProvidersHasNext(providersRes.data.hasNext || false);
      setProvidersHasPrevious(providersRes.data.hasPrevious || false);

      setAppointments(appointmentsRes.data.content || []);
      setAppointmentsTotalElements(appointmentsRes.data.totalElements || 0);
      setAppointmentsTotalPages(appointmentsRes.data.totalPages || 0);
      setAppointmentsHasNext(appointmentsRes.data.hasNext || false);
      setAppointmentsHasPrevious(appointmentsRes.data.hasPrevious || false);

      setError("");
    } catch {
      setError("Failed to fetch admin data. Verify your administrator session.");
    } finally {
      setLoading(false);
    }
  }, [
    token,
    usersPage,
    usersPageSize,
    providersPage,
    providersPageSize,
    appointmentsPage,
    appointmentsPageSize,
  ]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const deleteUser = async (userRecord) => {
    if (userRecord.username === currentUsername) {
      setError("You cannot delete your currently signed-in administrator account.");
      return;
    }
    if (
      !window.confirm(
        `Delete user "${userRecord.username}"? Associated appointments and provider data will also be removed.`
      )
    ) {
      return;
    }
    try {
      setError("");
      await api.delete(`/api/users/${userRecord.id}`);
      setSuccess(`User "${userRecord.username}" removed.`);
      fetchAdminData();
    } catch {
      setError("Failed to delete user.");
    }
  };

  const deleteProvider = async (providerRecord) => {
    if (
      !window.confirm(
        `Delete provider "${providerRecord.serviceName || providerRecord.user?.username}"?`
      )
    ) {
      return;
    }
    try {
      setError("");
      await api.delete(`/api/providers/${providerRecord.id}`);
      setSuccess("Provider profile deleted.");
      fetchAdminData();
    } catch {
      setError("Failed to delete provider.");
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm("Delete this appointment record?")) return;
    try {
      setError("");
      await api.delete(`/api/appointments/${appointmentId}`);
      setSuccess("Appointment deleted.");
      fetchAdminData();
    } catch {
      setError("Failed to delete appointment.");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesQuery =
        !q ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredProviders = useMemo(() => {
    const q = providerSearch.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        (p.serviceName || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.user?.username || "").toLowerCase().includes(q)
    );
  }, [providers, providerSearch]);

  const filteredAppointments = useMemo(() => {
    const q = appointmentSearch.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus =
        appointmentStatusFilter === "ALL" || a.status === appointmentStatusFilter;
      const matchesQuery =
        !q ||
        (a.user?.username || "").toLowerCase().includes(q) ||
        (a.provider?.serviceName || "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [appointments, appointmentSearch, appointmentStatusFilter]);

  return (
    <AppShell
      title="Admin Console"
      breadcrumb="Admin Console"
      primaryAction={{
        label: "Provider Onboarding",
        to: "/admin/providers",
        Icon: FiPlus,
      }}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              Platform Administration
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage registered users, service providers, and appointment activity.
            </p>
          </div>
          <Link
            to="/admin/providers"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Manage provider onboarding</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FeedbackBanner
          variant="error"
          message={error}
          onDismiss={() => setError("")}
        />
        <FeedbackBanner
          variant="success"
          message={success}
          onDismiss={() => setSuccess("")}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Users</span>
              <FiUsers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-2 tabular-nums">
              {loading ? "—" : usersTotalElements || platformStats.totalUsers}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active Providers</span>
              <FiBriefcase className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-2 tabular-nums">
              {loading
                ? "—"
                : providersTotalElements || platformStats.totalProviders}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Appointments</span>
              <FiCalendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-2 tabular-nums">
              {loading
                ? "—"
                : appointmentsTotalElements || platformStats.totalAppointments}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Pending Sessions</span>
              <FiClock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-display font-bold text-amber-600 mt-2 tabular-nums">
              {loading ? "—" : platformStats.upcomingAppointments}
            </div>
          </div>
        </div>

        {/* Workspace Section Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6 overflow-x-auto" aria-label="Admin sections">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              const badgeCount =
                tab.key === "users"
                  ? usersTotalElements
                  : tab.key === "providers"
                  ? providersTotalElements
                  : tab.key === "appointments"
                  ? appointmentsTotalElements
                  : null;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  {badgeCount !== null && (
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments Summary */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-display font-semibold text-slate-900">
                      Recent Appointments
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("appointments")}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View all
                    </button>
                  </div>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      No appointments recorded yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {appointments.slice(0, 5).map((apt) => (
                        <div
                          key={apt.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {apt.provider?.serviceName || "Service"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                              {apt.user?.username || "Client"} ·{" "}
                              {apt.appointmentDate
                                ? dayjs(apt.appointmentDate).format(
                                    "MMM D, YYYY · h:mm A"
                                  )
                                : "TBD"}
                            </div>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registered Providers Summary */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-display font-semibold text-slate-900">
                      Directory Providers
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("providers")}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View all
                    </button>
                  </div>
                  {providers.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      No providers registered yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {providers.slice(0, 5).map((prov) => (
                        <div
                          key={prov.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {prov.serviceName || "Unnamed Service"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              @{prov.user?.username || "unknown"}
                              {prov.city ? ` · ${prov.city}` : ""}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-600 tabular-nums shrink-0">
                            {(prov.availabilities || []).length} open slots
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {(activeTab === "users" || activeTab === "overview") && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Users
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All registered client, provider, and administrator accounts.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Filter username or email..."
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      aria-label="Filter users by role"
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All roles</option>
                      <option value="USER">Users</option>
                      <option value="PROVIDER">Providers</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                        <th className="py-3 pr-4">Username</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="py-3 pr-4 font-medium text-slate-900">
                            {u.username}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={u.role} />
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteUser(u)}
                              disabled={u.username === currentUsername}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-sm text-slate-500"
                          >
                            No matching users on this page.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={usersPage}
                  totalPages={usersTotalPages}
                  onPageChange={setUsersPage}
                  hasNext={usersHasNext}
                  hasPrevious={usersHasPrevious}
                  totalElements={usersTotalElements}
                  pageSize={usersPageSize}
                />
              </section>
            )}

            {/* PROVIDERS TAB */}
            {activeTab === "providers" && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Service Providers
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Published provider profiles and their service locations.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        placeholder="Filter service, city, or user..."
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <Link
                      to="/admin/providers"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Provider</span>
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                        <th className="py-3 pr-4">Username</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Open Slots</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProviders.map((prov) => (
                        <tr key={prov.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="py-3 pr-4 font-medium text-slate-900">
                            {prov.user?.username || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            {prov.serviceName || "Unnamed"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {prov.city || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-700 tabular-nums">
                            {(prov.availabilities || []).length}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteProvider(prov)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProviders.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-sm text-slate-500"
                          >
                            No matching providers on this page.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={providersPage}
                  totalPages={providersTotalPages}
                  onPageChange={setProvidersPage}
                  hasNext={providersHasNext}
                  hasPrevious={providersHasPrevious}
                  totalElements={providersTotalElements}
                  pageSize={providersPageSize}
                />
              </section>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === "appointments" && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Appointments
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      System-wide appointment bookings and current statuses.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={appointmentSearch}
                        onChange={(e) => setAppointmentSearch(e.target.value)}
                        placeholder="Filter client or service..."
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={appointmentStatusFilter}
                      onChange={(e) =>
                        setAppointmentStatusFilter(e.target.value)
                      }
                      aria-label="Filter appointments by status"
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                        <th className="py-3 pr-4">Client</th>
                        <th className="py-3 px-4">Service Provider</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="py-3 pr-4 font-medium text-slate-900">
                            {apt.user?.username || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            {apt.provider?.serviceName || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-600 tabular-nums whitespace-nowrap">
                            {apt.appointmentDate
                              ? dayjs(apt.appointmentDate).format(
                                  "MMM D, YYYY · h:mm A"
                                )
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={apt.status} />
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteAppointment(apt.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredAppointments.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-sm text-slate-500"
                          >
                            No matching appointments on this page.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={appointmentsPage}
                  totalPages={appointmentsTotalPages}
                  onPageChange={setAppointmentsPage}
                  hasNext={appointmentsHasNext}
                  hasPrevious={appointmentsHasPrevious}
                  totalElements={appointmentsTotalElements}
                  pageSize={appointmentsPageSize}
                />
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
