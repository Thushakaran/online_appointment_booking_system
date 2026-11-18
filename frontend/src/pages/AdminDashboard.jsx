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
  FiRefreshCw,
  FiEdit2,
  FiEye,
  FiDownload,
  FiCheck,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import api from "../api/axios";
import { dashboardAPI } from "../api/dashboard";
import DashboardShell from "../components/DashboardShell";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/toastContext";

const ROLE_TABS = [
  { id: "ALL", label: "All Roles" },
  { id: "USER", label: "Clients" },
  { id: "PROVIDER", label: "Providers" },
  { id: "ADMIN", label: "Admins" },
];

const STATUS_TABS = [
  { id: "ALL", label: "All" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function downloadCsv(filename, headers, rows) {
  const escapeCell = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const toast = useToast();
  const { token, role, user: currentUsername } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [platformStats, setPlatformStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState("");

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [providerSearch, setProviderSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("ALL");

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ username: "", email: "" });
  const [savingUser, setSavingUser] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);

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

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const fetchAdminData = useCallback(
    async (isManualRefresh = false) => {
      if (!token || role !== "ADMIN") return;
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [usersRes, providersRes, appointmentsRes, statsRes] =
          await Promise.all([
            api.get(
              `/api/users/paginated?page=${usersPage}&size=${usersPageSize}`
            ),
            api.get(
              `/api/providers/paginated?page=${providersPage}&size=${providersPageSize}`
            ),
            api.get(
              `/api/appointments/paginated?page=${appointmentsPage}&size=${appointmentsPageSize}`
            ),
            dashboardAPI.getStats().catch(() => null),
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
        setAppointmentsTotalElements(
          appointmentsRes.data.totalElements || 0
        );
        setAppointmentsTotalPages(appointmentsRes.data.totalPages || 0);
        setAppointmentsHasNext(appointmentsRes.data.hasNext || false);
        setAppointmentsHasPrevious(appointmentsRes.data.hasPrevious || false);

        if (statsRes) {
          setPlatformStats(statsRes);
        }

        setLastSyncedAt(new Date());
        setError("");
      } catch (requestError) {
        const endpoint = requestError?.config?.url;
        const status = requestError?.response?.status;
        const detail =
          requestError?.response?.data?.message ||
          requestError?.response?.data?.error;
        setError(
          [
            "Failed to fetch administrative records.",
            endpoint ? `Request: ${endpoint}.` : "",
            status ? `HTTP ${status}.` : "",
            detail || "Verify your admin session and backend connection.",
          ]
            .filter(Boolean)
            .join(" ")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      token,
      role,
      usersPage,
      usersPageSize,
      providersPage,
      providersPageSize,
      appointmentsPage,
      appointmentsPageSize,
    ]
  );

  useEffect(() => {
    fetchAdminData(false);
  }, [fetchAdminData]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setError("");
      if (deleteTarget.type === "user") {
        await api.delete(`/api/users/${deleteTarget.id}`);
        toast.success(`User "${deleteTarget.label}" deleted.`);
        if (users.length === 1 && usersPage > 0) {
          setUsersPage((p) => p - 1);
        }
      } else if (deleteTarget.type === "provider") {
        await api.delete(`/api/providers/${deleteTarget.id}`);
        toast.success(`Provider "${deleteTarget.label}" deleted.`);
        if (providers.length === 1 && providersPage > 0) {
          setProvidersPage((p) => p - 1);
        }
      } else if (deleteTarget.type === "appointment") {
        await api.delete(`/api/appointments/${deleteTarget.id}`);
        toast.success(`Appointment #${deleteTarget.id} removed.`);
        if (appointments.length === 1 && appointmentsPage > 0) {
          setAppointmentsPage((p) => p - 1);
        }
      }
      setDeleteTarget(null);
      await fetchAdminData(true);
    } catch (err) {
      const detail =
        err?.response?.data?.error || err?.response?.data?.message;
      const msg =
        detail || `Failed to delete ${deleteTarget.type}. Please try again.`;
      setError(msg);
      toast.error(msg);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openEditUserModal = (userRecord) => {
    setEditingUser(userRecord);
    setUserEditForm({
      username: userRecord.username || "",
      email: userRecord.email || "",
    });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSavingUser(true);
      setError("");
      await api.put(`/api/users/${editingUser.id}`, {
        username: userEditForm.username.trim(),
        email: userEditForm.email.trim(),
      });
      toast.success(`Account "${userEditForm.username.trim()}" updated.`);
      setEditingUser(null);
      await fetchAdminData(true);
    } catch (err) {
      const status = err?.response?.status;
      const detail =
        err?.response?.data?.error || err?.response?.data?.message;
      const msg =
        status === 409
          ? detail || "Username or email already exists."
          : detail || "Failed to update user account.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (!q) return true;
      return (
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        String(u.id).includes(q)
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
        (p.city || "").toLowerCase().includes(q) ||
        (p.state || "").toLowerCase().includes(q)
      );
    });
  }, [providers, providerSearch]);

  const filteredAppointments = useMemo(() => {
    const q = appointmentSearch.trim().toLowerCase();
    return appointments.filter((a) => {
      if (appointmentStatusFilter === "UPCOMING") {
        if (a.status !== "PENDING" && a.status !== "CONFIRMED") return false;
      } else if (
        appointmentStatusFilter !== "ALL" &&
        a.status !== appointmentStatusFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        (a.user?.username || "").toLowerCase().includes(q) ||
        (a.user?.email || "").toLowerCase().includes(q) ||
        (a.provider?.serviceName || "").toLowerCase().includes(q) ||
        (a.provider?.user?.username || "").toLowerCase().includes(q) ||
        String(a.id).includes(q)
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
        id: `appointment-${a.id}-${a.status}`,
        title: `${a.user?.username || "Client"} · ${
          a.provider?.serviceName || "Service"
        }`,
        detail: `${a.status} · ${dayjs(a.appointmentDate).format(
          "MMM D, YYYY · h:mm A"
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
    { to: "/admin/providers", label: "Provider Directory", icon: FiSliders },
    { to: "/providers", label: "Public Directory", icon: FiSearch },
  ];

  const totalUsersDisplay =
    platformStats?.totalUsers ?? usersTotalElements;
  const totalProvidersDisplay =
    platformStats?.totalProviders ?? providersTotalElements;
  const totalAppointmentsDisplay =
    platformStats?.totalAppointments ?? appointmentsTotalElements;
  const upcomingDisplay =
    platformStats?.upcomingAppointments ??
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/admin/providers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <FiBriefcase className="w-4 h-4" aria-hidden="true" />
            <span>Manage Providers</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Workspace Section Switcher & Sync Timestamp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start overflow-x-auto max-w-full">
            {[
              { id: "overview", label: "Overview" },
              { id: "users", label: "Users", count: usersTotalElements },
              {
                id: "providers",
                label: "Providers",
                count: providersTotalElements,
              },
              {
                id: "appointments",
                label: "Appointments",
                count: appointmentsTotalElements,
              },
            ].map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span className="font-mono tabular-nums text-slate-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {lastSyncedAt && (
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Updated {dayjs(lastSyncedAt).format("h:mm:ss A")}
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <span>{error}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchAdminData(true)}
                className="px-3 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-medium transition-colors"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setError("")}
                className="p-1 text-rose-500 hover:text-rose-700"
                aria-label="Dismiss error"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveSection("users")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Users
              </span>
              <FiUsers className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : totalUsersDisplay}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Registered client & staff accounts
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("providers")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Active Providers
              </span>
              <FiBriefcase
                className="w-4 h-4 text-indigo-500"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
              {loading ? "—" : totalProvidersDisplay}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Published specialist listings
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("appointments")}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Appointments
              </span>
              <FiCalendar
                className="w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : totalAppointmentsDisplay}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              All historical & active bookings
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAppointmentStatusFilter("UPCOMING");
              setActiveSection("appointments");
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Upcoming Sessions
              </span>
              <FiCalendar
                className="w-4 h-4 text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {loading ? "—" : upcomingDisplay}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Pending & confirmed schedule queue
            </p>
          </button>
        </div>

        {/* OVERVIEW SECTION */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Booking Status Distribution */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Booking Status Breakdown
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click any status to filter appointments
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {appointments.length} shown of {appointmentsTotalElements}
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 bg-slate-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      {
                        id: "CONFIRMED",
                        label: "Confirmed",
                        count: statusBreakdown.CONFIRMED,
                        color: "bg-emerald-500",
                      },
                      {
                        id: "PENDING",
                        label: "Pending",
                        count: statusBreakdown.PENDING,
                        color: "bg-amber-500",
                      },
                      {
                        id: "COMPLETED",
                        label: "Completed",
                        count: statusBreakdown.COMPLETED,
                        color: "bg-sky-500",
                      },
                      {
                        id: "CANCELLED",
                        label: "Cancelled",
                        count: statusBreakdown.CANCELLED,
                        color: "bg-rose-500",
                      },
                    ].map((row) => {
                      const pct = appointments.length
                        ? Math.round((row.count / appointments.length) * 100)
                        : 0;
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => {
                            setAppointmentStatusFilter(row.id);
                            setActiveSection("appointments");
                          }}
                          className="w-full text-left space-y-1.5 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
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
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Appointments Table */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Recent Bookings
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest client reservations across all providers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("appointments")}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>All bookings</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-slate-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No appointments recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                          <th className="text-left py-2.5 px-6">Client</th>
                          <th className="text-left py-2.5 px-4">Service</th>
                          <th className="text-left py-2.5 px-4">Scheduled</th>
                          <th className="text-right py-2.5 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.slice(0, 5).map((appt) => (
                          <tr
                            key={appt.id}
                            onClick={() =>
                              setInspectRecord({
                                type: "appointment",
                                data: appt,
                              })
                            }
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-6 font-medium text-slate-900 whitespace-nowrap">
                              {appt.user?.username || "Unknown"}
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                              {appt.provider?.serviceName || "Consultation"}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-xs tabular-nums whitespace-nowrap">
                              {dayjs(appt.appointmentDate).format(
                                "MMM D · h:mm A"
                              )}
                            </td>
                            <td className="py-3 px-6 text-right">
                              <StatusBadge status={appt.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom 2-Column Directory Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Service Providers
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Top listed practices on the platform
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("providers")}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Manage all</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-11 bg-slate-100 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  ) : providers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No providers registered yet.
                    </div>
                  ) : (
                    providers.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setInspectRecord({ type: "provider", data: p })
                        }
                        className="w-full text-left px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {p.serviceName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {p.user?.username || "Provider"}
                            {p.city ? ` · ${p.city}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-slate-600 tabular-nums shrink-0">
                          {p.servicePricing ? `$${p.servicePricing}` : "—"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Registered Accounts
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client, provider, and admin memberships
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("users")}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>View all</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-11 bg-slate-100 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No user accounts found.
                    </div>
                  ) : (
                    users.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0">
                            {(u.username || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {u.username}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={u.role} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS SECTION */}
        {activeSection === "users" && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">User Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage client, provider, and administrator accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {ROLE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setUserRoleFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        userRoleFilter === tab.id
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search username or email..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <select
                  aria-label="Users per page"
                  value={usersPageSize}
                  onChange={(e) => {
                    setUsersPageSize(Number(e.target.value));
                    setUsersPage(0);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      "appointflow-users.csv",
                      ["ID", "Username", "Email", "Role"],
                      filteredUsers.map((u) => [
                        u.id,
                        u.username,
                        u.email,
                        u.role,
                      ])
                    )
                  }
                  disabled={filteredUsers.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {(userSearch.trim() || userRoleFilter !== "ALL") && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Filtering current page: showing{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {filteredUsers.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {users.length}
                  </strong>{" "}
                  loaded users (page {usersPage + 1} of {Math.max(1, usersTotalPages)}).
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUserSearch("");
                    setUserRoleFilter("ALL");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Account</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isSelf =
                        currentUsername && u.username === currentUsername;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums">
                            #{u.id}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center shrink-0">
                                {(u.username || "U").slice(0, 2).toUpperCase()}
                              </span>
                              <span>{u.username}</span>
                              {isSelf && (
                                <span className="text-xs text-slate-400 font-normal">
                                  (you)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={u.role} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditUserModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? "You cannot delete your active session account"
                                    : "Delete user"
                                }
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "user",
                                    id: u.id,
                                    label: u.username,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          No users match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

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

        {/* PROVIDERS SECTION */}
        {activeSection === "providers" && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
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
                    placeholder="Search service, provider, city..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <select
                  aria-label="Providers per page"
                  value={providersPageSize}
                  onChange={(e) => {
                    setProvidersPageSize(Number(e.target.value));
                    setProvidersPage(0);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      "appointflow-providers.csv",
                      ["ID", "Username", "Service", "City", "State", "Pricing"],
                      filteredProviders.map((p) => [
                        p.id,
                        p.user?.username || "",
                        p.serviceName,
                        p.city || "",
                        p.state || "",
                        p.servicePricing || "",
                      ])
                    )
                  }
                  disabled={filteredProviders.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <Link
                  to="/admin/providers"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 whitespace-nowrap"
                >
                  Directory Console
                </Link>
              </div>
            </div>

            {providerSearch.trim() && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Filtering current page: showing{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {filteredProviders.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {providers.length}
                  </strong>{" "}
                  loaded providers (page {providersPage + 1} of{" "}
                  {Math.max(1, providersTotalPages)}).
                </span>
                <button
                  type="button"
                  onClick={() => setProviderSearch("")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Service & Owner</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Pricing</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProviders.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums">
                          #{p.id}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-medium text-slate-900 truncate">
                            {p.serviceName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            @{p.user?.username || "unassigned"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums whitespace-nowrap">
                          {p.phoneNumber || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-xs tabular-nums whitespace-nowrap">
                          {p.servicePricing ? `$${p.servicePricing}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setInspectRecord({ type: "provider", data: p })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "provider",
                                  id: p.id,
                                  label: p.serviceName,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors whitespace-nowrap"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProviders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          No providers match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

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

        {/* APPOINTMENTS SECTION */}
        {activeSection === "appointments" && (
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  All Appointments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform-wide bookings across clients and providers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAppointmentStatusFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        appointmentStatusFilter === tab.id
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    placeholder="Search client or service..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <select
                  aria-label="Appointments per page"
                  value={appointmentsPageSize}
                  onChange={(e) => {
                    setAppointmentsPageSize(Number(e.target.value));
                    setAppointmentsPage(0);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      "appointflow-appointments.csv",
                      ["ID", "Client", "Service", "Provider", "Date", "Status"],
                      filteredAppointments.map((a) => [
                        a.id,
                        a.user?.username || "",
                        a.provider?.serviceName || "",
                        a.provider?.user?.username || "",
                        dayjs(a.appointmentDate).format("YYYY-MM-DD HH:mm"),
                        a.status,
                      ])
                    )
                  }
                  disabled={filteredAppointments.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {(appointmentSearch.trim() || appointmentStatusFilter !== "ALL") && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Filtering current page: showing{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {filteredAppointments.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900 font-semibold tabular-nums">
                    {appointments.length}
                  </strong>{" "}
                  loaded appointments (page {appointmentsPage + 1} of{" "}
                  {Math.max(1, appointmentsTotalPages)}).
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentSearch("");
                    setAppointmentStatusFilter("ALL");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Client</th>
                      <th className="text-left py-3 px-4">Service & Provider</th>
                      <th className="text-left py-3 px-4">Date & Time</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums">
                          #{appt.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">
                            {appt.user?.username || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appt.user?.email || "—"}
                          </p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-medium text-slate-900 truncate">
                            {appt.provider?.serviceName || "Consultation"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            @{appt.provider?.user?.username || "provider"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs tabular-nums whitespace-nowrap">
                          {dayjs(appt.appointmentDate).format(
                            "MMM D, YYYY · h:mm A"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setInspectRecord({
                                  type: "appointment",
                                  data: appt,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "appointment",
                                  id: appt.id,
                                  label: `Appointment #${appt.id}`,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors whitespace-nowrap"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          No appointments match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

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

      {/* Edit User Modal */}
      <Modal
        open={Boolean(editingUser)}
        onClose={() => !savingUser && setEditingUser(null)}
        disableClose={savingUser}
        labelledBy="edit-user-title"
        maxWidth="max-w-md"
      >
        {editingUser && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  id="edit-user-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Edit User Account #{editingUser.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role: {editingUser.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-edit-username"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="admin-edit-username"
                  type="text"
                  required
                  value={userEditForm.username}
                  onChange={(e) =>
                    setUserEditForm({
                      ...userEditForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-edit-email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="admin-edit-email"
                  type="email"
                  required
                  value={userEditForm.email}
                  onChange={(e) =>
                    setUserEditForm({ ...userEditForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{savingUser ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Inspect Detail Modal */}
      <Modal
        open={Boolean(inspectRecord)}
        onClose={() => setInspectRecord(null)}
        labelledBy="inspect-record-title"
        maxWidth="max-w-lg"
      >
        {inspectRecord && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-mono text-slate-400 tabular-nums">
                  {inspectRecord.type === "provider"
                    ? `Provider #${inspectRecord.data.id}`
                    : `Appointment #${inspectRecord.data.id}`}
                </p>
                <h3
                  id="inspect-record-title"
                  className="text-base font-semibold text-slate-900 mt-0.5"
                >
                  {inspectRecord.type === "provider"
                    ? inspectRecord.data.serviceName
                    : inspectRecord.data.provider?.serviceName || "Consultation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {inspectRecord.type === "provider" ? (
              <div className="space-y-4 text-sm">
                {inspectRecord.data.description && (
                  <p className="text-slate-600 leading-relaxed">
                    {inspectRecord.data.description}
                  </p>
                )}
                <dl className="divide-y divide-slate-100 border-t border-slate-100">
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-500">Account</dt>
                    <dd className="font-medium text-slate-900">
                      {inspectRecord.data.user?.username || "—"}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-500 flex items-center gap-1.5">
                      <FiMail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email</span>
                    </dt>
                    <dd className="text-slate-800">
                      {inspectRecord.data.user?.email || "—"}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-500 flex items-center gap-1.5">
                      <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone</span>
                    </dt>
                    <dd className="font-mono text-xs text-slate-800 tabular-nums">
                      {inspectRecord.data.phoneNumber || "—"}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-500 flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Address</span>
                    </dt>
                    <dd className="text-right text-slate-800">
                      {[
                        inspectRecord.data.address,
                        inspectRecord.data.city,
                        inspectRecord.data.state,
                        inspectRecord.data.zipCode,
                        inspectRecord.data.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-500">Rate</dt>
                    <dd className="font-mono font-medium text-slate-900 tabular-nums">
                      {inspectRecord.data.servicePricing
                        ? `$${inspectRecord.data.servicePricing}`
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <dl className="divide-y divide-slate-100 border-t border-slate-100 text-sm">
                <div className="py-2.5 flex justify-between items-center gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={inspectRecord.data.status} />
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500">Scheduled Time</dt>
                  <dd className="font-mono text-xs font-medium text-slate-900 tabular-nums">
                    {dayjs(inspectRecord.data.appointmentDate).format(
                      "dddd, MMM D, YYYY · h:mm A"
                    )}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500">Client</dt>
                  <dd className="text-right text-slate-900 font-medium">
                    {inspectRecord.data.user?.username || "Unknown"} (
                    {inspectRecord.data.user?.email || "No email"})
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500">Provider</dt>
                  <dd className="text-right text-slate-900 font-medium">
                    {inspectRecord.data.provider?.user?.username || "Unknown"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500">Location</dt>
                  <dd className="text-right text-slate-700">
                    {[
                      inspectRecord.data.provider?.address,
                      inspectRecord.data.provider?.city,
                      inspectRecord.data.provider?.state,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

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
