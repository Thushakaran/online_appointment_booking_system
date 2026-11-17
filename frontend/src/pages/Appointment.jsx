import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiCalendar,
  FiSearch,
  FiClock,
  FiCheck,
  FiX,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";

const FILTER_TABS = [
  { id: "ALL", label: "All" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

const getAppointmentDate = (appointment) => {
  if (appointment.appointmentDate) {
    return new Date(appointment.appointmentDate);
  }
  if (appointment.availability?.availableDate) {
    return new Date(appointment.availability.availableDate);
  }
  return new Date(0);
};

const sortAppointments = (appointments) => {
  return [...appointments].sort((a, b) => {
    const priority = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    const pa = priority[a.status] ?? 4;
    const pb = priority[b.status] ?? 4;
    if (pa !== pb) return pa - pb;
    return getAppointmentDate(a) - getAppointmentDate(b);
  });
};

export default function Appointments() {
  const { userId } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(async (uid) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/appointments/user/${uid}`);
      setItems(sortAppointments(res.data || []));
      setErr("");
    } catch (e) {
      if (e?.response?.status === 403) {
        setErr("Access denied. Please make sure you are logged in.");
      } else if (e?.response?.status === 401) {
        setErr("Authentication failed. Please log in again.");
      } else {
        setErr("Failed to load appointments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      load(userId);
    } else {
      setErr("Please log in to view your appointments.");
      setLoading(false);
    }
  }, [userId, load]);

  const updateStatus = async (id, status) => {
    setErr("");
    setMsg("");
    setActionLoadingId(id);
    try {
      if (status === "CANCELLED") {
        await api.put(`/api/appointments/${id}/cancel`);
        setMsg("Appointment cancelled and slot released.");
      } else if (status === "CONFIRMED") {
        await api.put(`/api/appointments/${id}/confirm`);
        setMsg("Appointment confirmed.");
      } else {
        await api.put(`/api/appointments/${id}/status`, status, {
          headers: { "Content-Type": "text/plain" },
        });
        setMsg(`Appointment updated to ${status.toLowerCase()}.`);
      }
      await load(userId);
    } catch (e) {
      if (e?.response?.status === 403) {
        setErr("Access denied. You do not have permission for this action.");
      } else if (e?.response?.status === 401) {
        setErr("Session expired. Please log in again.");
      } else {
        setErr(
          e?.response?.data?.message ||
            "Failed to update appointment status. Please try again."
        );
      }
    } finally {
      setActionLoadingId(null);
      setCancelTarget(null);
    }
  };

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      UPCOMING: items.filter(
        (a) => a.status === "PENDING" || a.status === "CONFIRMED"
      ).length,
      PENDING: items.filter((a) => a.status === "PENDING").length,
      CONFIRMED: items.filter((a) => a.status === "CONFIRMED").length,
      COMPLETED: items.filter((a) => a.status === "COMPLETED").length,
      CANCELLED: items.filter((a) => a.status === "CANCELLED").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((appt) => {
      if (statusFilter === "UPCOMING") {
        if (appt.status !== "PENDING" && appt.status !== "CONFIRMED") {
          return false;
        }
      } else if (statusFilter !== "ALL" && appt.status !== statusFilter) {
        return false;
      }

      if (!q) return true;
      return (
        (appt.provider?.serviceName || "").toLowerCase().includes(q) ||
        (appt.provider?.user?.username || "").toLowerCase().includes(q) ||
        (appt.provider?.city || "").toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, searchQuery]);

  const notifications = useMemo(
    () =>
      items
        .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
        .slice(0, 5)
        .map((a) => ({
          id: `appt-${a.id}`,
          title: `${a.provider?.serviceName || "Consultation"} (${a.status})`,
          detail: dayjs(getAppointmentDate(a)).format("MMM D, YYYY · h:mm A"),
        })),
    [items]
  );

  return (
    <DashboardShell
      title="My Appointments"
      breadcrumb="Client Workspace"
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
        {err && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{err}</span>
            <button
              type="button"
              onClick={() => setErr("")}
              className="text-rose-500 hover:text-rose-700 p-1"
              aria-label="Dismiss error"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {msg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{msg}</span>
            <button
              type="button"
              onClick={() => setMsg("")}
              className="text-emerald-600 hover:text-emerald-800 p-1"
              aria-label="Dismiss notice"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono tabular-nums ${
                      active ? "text-indigo-100" : "text-slate-500"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <FiSearch
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service, provider, city..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-6 h-52 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FiCalendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900">
              {items.length === 0
                ? "No appointments yet"
                : "No matching appointments"}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {items.length === 0
                ? "Explore our provider directory to find a specialist and reserve an available time slot."
                : "Try clearing your search filter or switching status tabs."}
            </p>
            {items.length === 0 ? (
              <Link
                to="/providers"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Providers
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((appointment) => {
              const apptDate = getAppointmentDate(appointment);
              const isPending = appointment.status === "PENDING";
              const isConfirmed = appointment.status === "CONFIRMED";
              const canCancel = isPending || isConfirmed;
              const isBusy = actionLoadingId === appointment.id;

              return (
                <div
                  key={appointment.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-slate-400 tabular-nums">
                          #{appointment.id}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900 truncate mt-0.5">
                          {appointment.provider?.serviceName || "Consultation"}
                        </h3>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <FiBriefcase
                          className="w-4 h-4 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {appointment.provider?.user?.username || "Provider"}
                        </span>
                      </div>

                      {appointment.provider?.city && (
                        <div className="flex items-center gap-2">
                          <FiMapPin
                            className="w-4 h-4 text-slate-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {appointment.provider.city}
                            {appointment.provider.state
                              ? `, ${appointment.provider.state}`
                              : ""}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-slate-900 font-medium tabular-nums">
                        <FiClock
                          className="w-4 h-4 text-indigo-600 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {apptDate.getTime() > 0
                            ? dayjs(apptDate).format("MMM D, YYYY · h:mm A")
                            : "Date unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-500 tabular-nums truncate">
                      {appointment.provider?.servicePricing
                        ? `$${appointment.provider.servicePricing}`
                        : "Standard rate"}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateStatus(appointment.id, "CONFIRMED")
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setCancelTarget(appointment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          <FiX className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                      {!canCancel && (
                        <Link
                          to={
                            appointment.provider?.id
                              ? `/book-appointment/${appointment.provider.id}`
                              : "/providers"
                          }
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                        >
                          Book again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel appointment?"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your ${
                cancelTarget.provider?.serviceName || "appointment"
              } scheduled for ${dayjs(getAppointmentDate(cancelTarget)).format(
                "MMM D, YYYY at h:mm A"
              )}? The time slot will be released.`
            : ""
        }
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Booking"
        variant="danger"
        loading={Boolean(actionLoadingId)}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() =>
          cancelTarget && updateStatus(cancelTarget.id, "CANCELLED")
        }
      />
    </DashboardShell>
  );
}
