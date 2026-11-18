import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiSearch,
  FiShield,
  FiSliders,
  FiXCircle,
  FiBriefcase,
} from "react-icons/fi";
import { dashboardAPI } from "../api/dashboard";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";

function PublicLanding() {
  const { token, role } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch {
        setStats({
          totalProviders: 0,
          totalAppointments: 0,
          upcomingAppointments: 0,
          totalUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const primaryCta = useMemo(() => {
    if (!token) return { to: "/providers", label: "Browse Providers" };
    if (role === "PROVIDER") return { to: "/provider-dashboard", label: "Open Provider Dashboard" };
    if (role === "ADMIN") return { to: "/admin-dashboard", label: "Open Admin Console" };
    return { to: "/dashboard", label: "Open My Dashboard" };
  }, [token, role]);

  return (
    <div className="bg-[#faf9fc] text-slate-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-slate-200/80 saas-ambient-header overflow-hidden">
        <div
          className="pointer-events-none absolute -top-28 right-0 w-[420px] h-[420px] rounded-full bg-violet-200/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 mb-3">
                Appointment Scheduling Platform
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Schedule trusted specialists{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  without the back-and-forth
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Discover verified service providers, inspect live time slots, and
                confirm appointments in seconds—with dedicated portals for clients,
                providers, and administrators.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to={primaryCta.to}
                  className="saas-btn-primary px-6 py-3 text-sm whitespace-nowrap"
                >
                  <span>{primaryCta.label}</span>
                  <FiArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                {token ? (
                  role !== "PROVIDER" && (
                    <Link
                      to="/appointments"
                      className="saas-btn-secondary px-5 py-3 text-sm whitespace-nowrap"
                    >
                      My Appointments
                    </Link>
                  )
                ) : (
                  <Link
                    to="/register"
                    className="saas-btn-secondary px-5 py-3 text-sm whitespace-nowrap"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50 p-1.5 shadow-[0_18px_45px_-18px_rgba(124,58,237,0.22)]">
                <div className="w-full h-full rounded-xl overflow-hidden min-h-[280px] lg:min-h-[380px] bg-slate-100">
                  <img
                    src="/assets/images/hero_scheduling_clinic_1794912360931.jpg"
                    alt="Modern appointment consultation workspace"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Live Platform KPI Strip */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="saas-card p-5 transition-all duration-200 hover:border-violet-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Active Providers
                </p>
                <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <FiBriefcase className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalProviders}
              </p>
            </div>
            <div className="saas-card p-5 transition-all duration-200 hover:border-violet-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Total Bookings
                </p>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FiCalendar className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalAppointments}
              </p>
            </div>
            <div className="bg-gradient-to-br from-violet-50/90 to-purple-50/70 border border-violet-200/80 rounded-2xl p-5 shadow-[0_6px_20px_-6px_rgba(124,58,237,0.1)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-violet-800">
                  Upcoming Sessions
                </p>
                <span className="w-8 h-8 rounded-xl bg-white text-violet-600 border border-violet-200/70 flex items-center justify-center">
                  <FiClock className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold text-violet-700 font-mono tabular-nums">
                {loading ? "—" : stats.upcomingAppointments}
              </p>
            </div>
            <div className="saas-card p-5 transition-all duration-200 hover:border-violet-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Registered Users
                </p>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FiUsers className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 mb-2">
            Role-Focused Portals
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Built for every step in the booking lifecycle
          </h2>
          <p className="mt-2.5 text-slate-600">
            Clear workflows for clients booking care, providers managing open
            slots, and administrators overseeing operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card-interactive p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200/70 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FiSearch className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  01
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Browse & Book Providers
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Search verified specialists by service name, city, or specialty,
                inspect real-time open slots, and confirm in one flow.
              </p>
            </div>
            <Link
              to="/providers"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              <span>Explore directory</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="saas-card-interactive p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/70 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FiSliders className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  02
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Provider Schedule Control
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Publish available time windows, edit or retire open slots, view
                client contact details, and confirm or complete bookings.
              </p>
            </div>
            <Link
              to={role === "PROVIDER" ? "/provider-dashboard" : "/register"}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              <span>{role === "PROVIDER" ? "Open provider portal" : "Register as provider"}</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="saas-card-interactive p-6 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-100 border border-purple-200/70 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FiShield className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  03
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Centralized Administration
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Monitor platform activity, manage user accounts, onboard service
                providers, and oversee appointment statuses from one console.
              </p>
            </div>
            <Link
              to={role === "ADMIN" ? "/admin-dashboard" : "/login"}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              <span>{role === "ADMIN" ? "Open admin console" : "Sign in to portal"}</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserWorkspaceDashboard() {
  const { userId, user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [apptRes, provRes] = await Promise.all([
          userId ? api.get(`/api/appointments/user/${userId}`) : Promise.resolve({ data: [] }),
          api.get("/api/providers/paginated?page=0&size=3"),
        ]);
        setAppointments(apptRes.data || []);
        setProviders(provRes.data?.content || []);
        setError("");
      } catch {
        setError("Unable to load your dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)),
    [appointments]
  );

  const history = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED")
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)),
    [appointments]
  );

  const notifications = useMemo(
    () =>
      upcoming.slice(0, 5).map((a) => ({
        id: `appointment-${a.id}-${a.status}`,
        title: `${a.provider?.serviceName || "Appointment"} (${a.status})`,
        detail: dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A"),
      })),
    [upcoming]
  );

  const stats = useMemo(
    () => ({
      total: appointments.length,
      upcoming: upcoming.length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
    }),
    [appointments, upcoming]
  );

  return (
    <DashboardShell
      title="Client Overview"
      breadcrumb="Dashboard"
      notifications={notifications}
      actions={
        <Link
          to="/providers"
          className="saas-btn-primary px-4 py-2 text-sm whitespace-nowrap"
        >
          <FiCalendar className="w-4 h-4" aria-hidden="true" />
          <span>Book Appointment</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative z-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {user}
            </h2>
            <p className="text-sm text-violet-100 mt-1 max-w-xl">
              Track your upcoming bookings, review past visits, or schedule a new consultation.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/appointments"
              className="px-4 py-2 text-sm font-semibold text-violet-700 bg-white rounded-xl hover:bg-violet-50 transition-colors whitespace-nowrap shadow-sm"
            >
              Manage Bookings
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 text-sm font-medium text-white bg-white/15 border border-white/25 rounded-xl hover:bg-white/25 transition-colors whitespace-nowrap"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="saas-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Bookings</span>
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <FiCalendar className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.total}
            </p>
          </div>
          <div className="saas-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Upcoming</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiClock className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.upcoming}
            </p>
          </div>
          <div className="saas-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Confirmed</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {loading ? "—" : stats.confirmed}
            </p>
          </div>
          <div className="saas-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Completed</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiUsers className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-violet-600 font-mono tabular-nums">
              {loading ? "—" : stats.completed}
            </p>
          </div>
        </div>

        {/* Upcoming & History Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-7 saas-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
              <h3 className="font-display font-bold text-slate-900">Upcoming Appointments</h3>
              <Link
                to="/appointments"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
              >
                <span>View all</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">No upcoming appointments</p>
                <p className="text-xs text-slate-500 mt-1">
                  Browse providers to schedule your next session.
                </p>
                <Link
                  to="/providers"
                  className="saas-btn-primary mt-4 px-4 py-2 text-xs"
                >
                  Find a Provider
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-violet-50/35 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {appt.provider?.serviceName || "Consultation"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {appt.provider?.user?.username || "Provider"} ·{" "}
                        {dayjs(appt.appointmentDate).format("MMM D, YYYY · h:mm A")}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="lg:col-span-5 saas-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
              <h3 className="font-display font-bold text-slate-900">Appointment History</h3>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {history.length} past
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FiXCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">No history yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Completed and cancelled bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {appt.provider?.serviceName || "Service"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {dayjs(appt.appointmentDate).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Providers for Quick Booking */}
        <div className="saas-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-slate-900">Featured Providers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a provider to view open time slots and book immediately.
              </p>
            </div>
            <Link
              to="/providers"
              className="text-sm font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>All providers</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                to={`/book-appointment/${provider.id}`}
                state={{ provider }}
                className="group border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40 hover:bg-white hover:border-violet-300 hover:shadow-md hover:shadow-violet-600/10 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                    {provider.serviceName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {provider.user?.username || "Specialist"}
                    {provider.city ? ` · ${provider.city}` : ""}
                  </p>
                  {provider.description && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {provider.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 font-mono tabular-nums">
                    {provider.servicePricing ? `$${provider.servicePricing}` : "Standard rate"}
                  </span>
                  <span className="text-violet-600 inline-flex items-center gap-1">
                    <span>Book slot</span>
                    <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const { token, role } = useSelector((state) => state.auth);

  if (location.pathname === "/dashboard" && token && role === "USER") {
    return <UserWorkspaceDashboard />;
  }

  return <PublicLanding />;
}
