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
    <div className="bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-indigo-600 mb-3">
                Appointment Scheduling Platform
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
                Schedule trusted specialists without the back-and-forth
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Discover verified service providers, inspect live time slots, and
                confirm appointments in seconds—with dedicated portals for clients,
                providers, and administrators.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <span>{primaryCta.label}</span>
                  <FiArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                {token ? (
                  role !== "PROVIDER" && (
                    <Link
                      to="/appointments"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      My Appointments
                    </Link>
                  )
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px] lg:min-h-[380px]">
                <img
                  src="/assets/images/hero_scheduling_clinic_1794912360931.jpg"
                  alt="Modern appointment consultation workspace"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Live Platform KPI Strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                Active Providers
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalProviders}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                Total Bookings
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalAppointments}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                Upcoming Sessions
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-600 font-mono tabular-nums">
                {loading ? "—" : stats.upcomingAppointments}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                Registered Users
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {loading ? "—" : stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Built for every role in the booking lifecycle
          </h2>
          <p className="mt-2 text-slate-600">
            Clear workflows for clients booking care, providers managing open
            slots, and administrators overseeing operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FiSearch className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Browse & Book Providers
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Search verified specialists by service name, city, or specialty,
                inspect real-time open slots, and confirm in one flow.
              </p>
            </div>
            <Link
              to="/providers"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>Explore directory</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FiSliders className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Provider Schedule Control
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Publish available time windows, edit or retire open slots, view
                client contact details, and confirm or complete bookings.
              </p>
            </div>
            <Link
              to={role === "PROVIDER" ? "/provider-dashboard" : "/register"}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>{role === "PROVIDER" ? "Open provider portal" : "Register as provider"}</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <FiShield className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Centralized Administration
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Monitor platform activity, manage user accounts, onboard service
                providers, and oversee appointment statuses from one console.
              </p>
            </div>
            <Link
              to={role === "ADMIN" ? "/admin-dashboard" : "/login"}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>{role === "ADMIN" ? "Open admin console" : "Sign in to portal"}</span>
              <FiArrowRight className="w-4 h-4" />
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <FiCalendar className="w-4 h-4" aria-hidden="true" />
          <span>Book Appointment</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Welcome back, {user}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Track your upcoming bookings, review past visits, or schedule a new consultation.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/appointments"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Manage Bookings
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Bookings</span>
              <FiCalendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.total}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Upcoming</span>
              <FiClock className="w-4 h-4 text-amber-500" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.upcoming}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Confirmed</span>
              <FiCheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.confirmed}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Completed</span>
              <FiUsers className="w-4 h-4 text-sky-500" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading ? "—" : stats.completed}
            </p>
          </div>
        </div>

        {/* Upcoming & History Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Upcoming Appointments</h3>
              <Link
                to="/appointments"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 text-center">
                <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">No upcoming appointments</p>
                <p className="text-xs text-slate-500 mt-1">
                  Browse providers to schedule your next session.
                </p>
                <Link
                  to="/providers"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                >
                  Find a Provider
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
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
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Appointment History</h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {history.length} past
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center">
                <FiXCircle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No completed or cancelled bookings yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="px-6 py-4 flex items-center justify-between gap-3">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Featured Providers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a provider to view open time slots and book immediately.
              </p>
            </div>
            <Link
              to="/providers"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
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
                className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-slate-50/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {provider.serviceName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {provider.user?.username || "Specialist"}
                    {provider.city ? ` · ${provider.city}` : ""}
                  </p>
                  {provider.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {provider.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 font-mono tabular-nums">
                    {provider.servicePricing ? `$${provider.servicePricing}` : "Standard rate"}
                  </span>
                  <span className="text-indigo-600 inline-flex items-center gap-1">
                    Book slot <FiArrowRight className="w-3.5 h-3.5" />
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
