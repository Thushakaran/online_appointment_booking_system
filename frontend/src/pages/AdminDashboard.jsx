import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiSearch,
  FiTrash2,
  FiX,
  FiArrowRight,
  FiSliders,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function AdminDashboard() {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [providerSearch, setProviderSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("ALL");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state for users
  const [usersPage, setUsersPage] = useState(0);
  const usersPageSize = 10;
  const [usersTotalElements, setUsersTotalElements] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersHasNext, setUsersHasNext] = useState(false);
  const [usersHasPrevious, setUsersHasPrevious] = useState(false);

  // Pagination state for providers
  const [providersPage, setProvidersPage] = useState(0);
  const providersPageSize = 10;
  const [providersTotalElements, setProvidersTotalElements] = useState(0);
  const [providersTotalPages, setProvidersTotalPages] = useState(0);
  const [providersHasNext, setProvidersHasNext] = useState(false);
  const [providersHasPrevious, setProvidersHasPrevious] = useState(false);

  // Pagination state for appointments
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const appointmentsPageSize = 10;
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
    if (!token || role !== "ADMIN") return;
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
      setError(
        "Failed to fetch administrative records. Verify your admin session."
      );
    } finally {
      setLoading(false);
    }
  }, [token, role, usersPage, providersPage, appointmentsPage]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      if (deleteTarget.type === "user") {
        await api.delete(`/api/users/${deleteTarget.id}`);
        setNotice(`User "${deleteTarget.label}" deleted.`);
      } else if (deleteTarget.type === "provider") {
        await api.delete(`/api/providers/${deleteTarget.id}`);
        setNotice(`Provider "${deleteTarget.label}" deleted.`);
      } else if (deleteTarget.type === "appointment") {
        await api.delete(`/api/appointments/${deleteTarget.id}`);
        setNotice(`Appointment #${deleteTarget.id} removed.`);
      }
      setDeleteTarget(null);
      await fetchAdminData();
    } catch {
      setError(`Failed to delete ${deleteTarget.type}. Please try again.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (!q) return true;
      return (
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredProviders = useMemo(() => {
    const q = providerSearch.trim().toLowerCase();
    return providers.filter((p) => {
      if (!q) return true;
      return (
        (p.serviceName || "").toLowerCase().includes(q) ||
        (p.user?.username || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q)
      );
    });
  }, [providers, providerSearch]);

  const filteredAppointments = useMemo(() => {
    const q = appointmentSearch.trim().toLowerCase();
    return appointments.filter((a) => {
      if (
        appointmentStatusFilter !== "ALL" &&
        a.status !== appointmentStatusFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        (a.user?.username || "").toLowerCase().includes(q) ||
        (a.provider?.serviceName || "").toLowerCase().includes(q) ||
        (a.provider?.user?.username || "").toLowerCase().includes(q)
      );
    });
  }, [appointments, appointmentSearch, appointmentStatusFilter]);

  const statusBreakdown = useMemo(() => {
    const counts = {
      CONFIRMED: 0,
      PENDING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    appointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });
    return counts;
  }, [appointments]);

  const notifications = useMemo(
    () =>
      appointments.slice(0, 5).map((a) => ({
        id: `adm-appt-${a.id}`,
        title: `${a.user?.username || "Client"} → ${
          a.provider?.serviceName || "Service"
        }`,
        detail: `${a.status} · ${dayjs(a.appointmentDate).format(
          "MMM D, YYYY"
        )}`,
      })),
    [appointments]
  );

  const navItems = [
    { sectionId: "overview", label: "Overview", icon: FiGrid },
    {
      sectionId: "users",
      label: "Users",
      icon: FiUsers,
      count: usersTotalElements,
    },
    {
      sectionId: "providers",
      label: "Providers",
      icon: FiBriefcase,
      count: providersTotalElements,
    },
    {
      sectionId: "appointments",
      label: "Appointments",
      icon: FiCalendar,
      count: appointmentsTotalElements,
    },
    { to: "/admin/providers", label: "Provider Onboarding", icon: FiSliders },
  ];

  const activeUpcomingCount =
    statusBreakdown.PENDING + statusBreakdown.CONFIRMED;

  return (
    <DashboardShell
      title="Admin Console"
      breadcrumb="Platform Administration"
      customNavItems={navItems}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      notifications={notifications}
      actions={
        <Link
          to="/admin/providers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <FiBriefcase className="w-4 h-4" />
          <span>Manage Providers</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveSection("users")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500">Total Users</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : usersTotalElements}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("providers")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500">
              Active Providers
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
              {loading ? "—" : providersTotalElements}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("appointments")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500">
              Total Appointments
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : appointmentsTotalElements}
            </p>
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">
              Active Upcoming
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {loading ? "—" : activeUpcomingCount}
            </p>
          </div>
        </div>

        {/* Overview Summary Panels */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Booking Status Distribution
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  Current page ({appointments.length})
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Confirmed",
                    count: statusBreakdown.CONFIRMED,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Pending",
                    count: statusBreakdown.PENDING,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Completed",
                    count: statusBreakdown.COMPLETED,
                    color: "bg-sky-500",
                  },
                  {
                    label: "Cancelled",
                    count: statusBreakdown.CANCELLED,
                    color: "bg-rose-500",
                  },
                ].map((row) => {
                  const pct = appointments.length
                    ? Math.round((row.count / appointments.length) * 100)
                    : 0;
                  return (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">
                          {row.label}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {row.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Recent Appointments
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection("appointments")}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                >
                  <span>View all</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {appt.provider?.serviceName || "Consultation"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums truncate">
                        Client: {appt.user?.username || "Unknown"} ·{" "}
                        {dayjs(appt.appointmentDate).format(
                          "MMM D, YYYY · h:mm A"
                        )}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
                {!loading && appointments.length === 0 && (
                  <p className="p-6 text-sm text-slate-500 text-center">
                    No appointments recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {(activeSection === "overview" || activeSection === "users") && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">User Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search registered clients, providers, and administrators.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filter users..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Client</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Username</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {u.username}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "user",
                              id: u.id,
                              label: u.username,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        No users match the current filter.
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

        {/* Providers Table */}
        {(activeSection === "overview" || activeSection === "providers") && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Service Providers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active listings published in the client booking directory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    placeholder="Filter providers..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <Link
                  to="/admin/providers"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
                >
                  Edit / Add Providers
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Provider</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">City</th>
                    <th className="text-left py-3 px-4">Pricing</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {p.user?.username || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p.serviceName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums">
                        {p.servicePricing ? `$${p.servicePricing}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "provider",
                              id: p.id,
                              label: p.serviceName,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredProviders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        No providers match the current filter.
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

        {/* Appointments Table */}
        {(activeSection === "overview" || activeSection === "appointments") && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  All Appointments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform-wide bookings across clients and providers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    placeholder="Filter bookings..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
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
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Client</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {appt.user?.username || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {appt.provider?.serviceName || "Consultation"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums">
                        {dayjs(appt.appointmentDate).format(
                          "MMM D, YYYY · h:mm A"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "appointment",
                              id: appt.id,
                              label: `Appointment #${appt.id}`,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredAppointments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        No appointments match the current filter.
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
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.type || "record"}?`}
        description={`Are you sure you want to permanently remove ${
          deleteTarget?.label || "this item"
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
}
