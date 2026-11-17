import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import api from "../api/axios";
import { dashboardAPI } from "../api/dashboard";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import heroPhoto from "../assets/Photo1.jpg";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiMapPin,
  FiBell,
  FiSearch,
  FiCheck,
  FiX,
} from "react-icons/fi";

function GuestLanding() {
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalUsers: 0,
  });
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsData, provRes] = await Promise.all([
          dashboardAPI.getStats(),
          api.get("/api/providers/paginated?page=0&size=3"),
        ]);
        if (!cancelled) {
          setStats(statsData || {});
          setFeaturedProviders(provRes.data?.content || []);
        }
      } catch {
        // Leave fallback zeroes on network issue
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell forcePublicShell>
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-sm font-medium text-indigo-600 mb-3">
                Online Appointment Scheduling
              </p>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight leading-[1.12] text-balance mb-5">
                Book trusted service providers with live slot availability
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
                Discover specialists by service or location, compare transparent pricing, and schedule confirmed appointments in seconds—all from one unified platform.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/providers"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <span>Browse providers</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Create an account
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-72 sm:h-80 lg:h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={heroPhoto}
                  alt="Consultation and appointment scheduling workspace"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Live Platform Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-10 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
                {loading ? "—" : stats.totalProviders}
              </div>
              <div className="text-sm text-slate-600 mt-1">Active providers</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
                {loading ? "—" : stats.totalAppointments}
              </div>
              <div className="text-sm text-slate-600 mt-1">Total bookings</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-display font-bold text-indigo-600 tabular-nums">
                {loading ? "—" : stats.upcomingAppointments}
              </div>
              <div className="text-sm text-slate-600 mt-1">Pending sessions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
                {loading ? "—" : stats.totalUsers}
              </div>
              <div className="text-sm text-slate-600 mt-1">Registered users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Featured Service Providers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Explore available professionals and book an open time slot directly.
            </p>
          </div>
          <Link
            to="/providers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            <span>View all providers</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse space-y-3"
              >
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : featuredProviders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
            No providers listed yet. Check back soon or register as a provider.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-display font-semibold text-slate-900">
                      {provider.serviceName}
                    </h3>
                    {provider.servicePricing && (
                      <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                        ${provider.servicePricing}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>{provider.user?.username || "Provider"}</span>
                    {provider.city && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          {provider.city}
                          {provider.state ? `, ${provider.state}` : ""}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-5">
                    {provider.description || "Professional consultation and scheduled services."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {provider.availabilities?.length || 0} open{" "}
                    {(provider.availabilities?.length || 0) === 1 ? "slot" : "slots"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/book-appointment/${provider.id}`, {
                        state: { provider },
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                  >
                    <span>Book slot</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workflow Section */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              How scheduling works
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              From finding the right specialist to managing your upcoming visits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-mono font-semibold text-indigo-600 mb-2">
                01. Discover
              </div>
              <h3 className="text-base font-display font-semibold text-slate-900 mb-2">
                Search verified providers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter specialists by service type, city, or description to find the right fit for your schedule.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-mono font-semibold text-indigo-600 mb-2">
                02. Reserve
              </div>
              <h3 className="text-base font-display font-semibold text-slate-900 mb-2">
                Choose a live time slot
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review open dates and times published directly by the provider and confirm your appointment summary.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-mono font-semibold text-indigo-600 mb-2">
                03. Manage
              </div>
              <h3 className="text-base font-display font-semibold text-slate-900 mb-2">
                Track every status update
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Confirm or cancel upcoming appointments and monitor your complete booking history from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function UserDashboard() {
  const { userId, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadUserWorkspace = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [aptRes, provRes] = await Promise.all([
        api.get(`/api/appointments/user/${userId}`),
        api.get("/api/providers/paginated?page=0&size=3"),
      ]);
      const list = Array.isArray(aptRes.data) ? aptRes.data : [];
      list.sort(
        (a, b) =>
          new Date(a.appointmentDate || 0) - new Date(b.appointmentDate || 0)
      );
      setAppointments(list);
      setProviders(provRes.data?.content || []);
      setActionErr("");
    } catch {
      setActionErr("Unable to load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserWorkspace();
  }, [loadUserWorkspace]);

  const handleStatusAction = async (appointmentId, action) => {
    try {
      setBusyId(appointmentId);
      setActionErr("");
      setActionMsg("");
      await api.put(`/api/appointments/${appointmentId}/${action}`);
      setActionMsg(
        action === "confirm"
          ? "Appointment confirmed successfully."
          : "Appointment cancelled."
      );
      await loadUserWorkspace();
    } catch {
      setActionErr("Failed to update appointment status.");
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = appointments.filter(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED"
  );
  const history = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <AppShell title="Client Dashboard" breadcrumb="Overview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Welcome back, {user}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track your upcoming appointments, review history, and book new sessions.
            </p>
          </div>
          <Link
            to="/providers"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <FiSearch className="w-4 h-4" />
            <span>Find a provider</span>
          </Link>
        </div>

        <FeedbackBanner
          variant="success"
          message={actionMsg}
          onDismiss={() => setActionMsg("")}
        />
        <FeedbackBanner
          variant="error"
          message={actionErr}
          onDismiss={() => setActionErr("")}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">Total Bookings</div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
              {loading ? "—" : appointments.length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">Pending Action</div>
            <div className="text-2xl font-display font-bold text-amber-600 mt-1 tabular-nums">
              {loading ? "—" : pendingCount}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">Confirmed</div>
            <div className="text-2xl font-display font-bold text-emerald-600 mt-1 tabular-nums">
              {loading ? "—" : confirmedCount}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500">Completed</div>
            <div className="text-2xl font-display font-bold text-indigo-600 mt-1 tabular-nums">
              {loading ? "—" : completedCount}
            </div>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-display font-semibold text-slate-900">
                    Upcoming Appointments
                  </h2>
                </div>
                <Link
                  to="/appointments"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="p-10 text-center">
                  <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    No upcoming appointments
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">
                    Browse available providers to schedule your next appointment.
                  </p>
                  <Link
                    to="/providers"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse providers
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcoming.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">
                            {apt.provider?.serviceName || "Scheduled Service"}
                          </span>
                          <StatusBadge status={apt.status} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 tabular-nums">
                          <span>with {apt.provider?.user?.username || "Provider"}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {apt.appointmentDate
                              ? dayjs(apt.appointmentDate).format("MMM D, YYYY · h:mm A")
                              : "Date pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {apt.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={busyId === apt.id}
                            onClick={() => handleStatusAction(apt.id, "confirm")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === apt.id}
                          onClick={() => handleStatusAction(apt.id, "cancel")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 disabled:opacity-50 transition-colors"
                        >
                          <FiX className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Appointment History */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-slate-500" />
                  <h2 className="text-base font-display font-semibold text-slate-900">
                    Appointment History
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {history.length}
                </span>
              </div>

              {history.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  Completed and cancelled appointments will appear here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {apt.provider?.serviceName || "Service"}
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {apt.provider?.user?.username || "Provider"} ·{" "}
                          {apt.appointmentDate
                            ? dayjs(apt.appointmentDate).format("MMM D, YYYY · h:mm A")
                            : "N/A"}
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Rail: Notifications & Quick Book */}
          <div className="lg:col-span-4 space-y-6">
            {/* Notifications Panel */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBell className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-display font-semibold text-slate-900">
                    Notifications
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {upcoming.length}
                </span>
              </div>
              <div className="p-5 space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    You have no pending reminders right now.
                  </p>
                ) : (
                  upcoming.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                    >
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <FiCheckCircle
                          className={`w-3.5 h-3.5 shrink-0 ${
                            apt.status === "PENDING"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        />
                        <span className="truncate">
                          {apt.status === "PENDING"
                            ? "Confirmation needed"
                            : "Confirmed visit"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {apt.provider?.serviceName} on{" "}
                        <span className="tabular-nums font-medium">
                          {apt.appointmentDate
                            ? dayjs(apt.appointmentDate).format("MMM D, h:mm A")
                            : "TBD"}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quick Book Providers */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-display font-semibold text-slate-900">
                  Quick Book
                </h2>
                <Link
                  to="/providers"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  All providers
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {providers.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">
                    No providers available yet.
                  </div>
                ) : (
                  providers.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {p.serviceName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                          <FiMapPin className="w-3 h-3 shrink-0" />
                          <span>{p.city || "Remote / On-site"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/book-appointment/${p.id}`, {
                            state: { provider: p },
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0"
                      >
                        Book
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function Dashboard() {
  const { token, role } = useSelector((state) => state.auth);
  if (token && role === "USER") {
    return <UserDashboard />;
  }
  return <GuestLanding />;
}
