import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/axios";
import dayjs from "dayjs";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiCalendar,
  FiSearch,
  FiCheck,
  FiX,
} from "react-icons/fi";

export default function Appointments() {
  const { userId } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const getAppointmentDate = (appointment) => {
    if (appointment.appointmentDate) return new Date(appointment.appointmentDate);
    if (appointment.availability?.availableDate) {
      return new Date(appointment.availability.availableDate);
    }
    return new Date(0);
  };

  const sortAppointments = useCallback((appointments) => {
    return [...appointments].sort((a, b) => {
      const isPendingA = a.status === "PENDING";
      const isPendingB = b.status === "PENDING";
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      return getAppointmentDate(a) - getAppointmentDate(b);
    });
  }, []);

  const load = useCallback(async () => {
    if (!userId) {
      setErr("Please sign in to view your appointments.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/appointments/user/${userId}`);
      setItems(sortAppointments(res.data || []));
      setErr("");
    } catch (e) {
      if (e?.response?.status === 403) {
        setErr("Access denied. Please make sure you are signed in.");
      } else if (e?.response?.status === 401) {
        setErr("Authentication expired. Please sign in again.");
      } else {
        setErr("Failed to load appointments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, sortAppointments]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    if (
      status === "CANCELLED" &&
      !window.confirm("Are you sure you want to cancel this appointment?")
    ) {
      return;
    }

    setErr("");
    setMsg("");
    setBusyId(id);
    try {
      if (status === "CANCELLED") {
        await api.put(`/api/appointments/${id}/cancel`);
        setMsg("Appointment cancelled successfully.");
      } else if (status === "CONFIRMED") {
        await api.put(`/api/appointments/${id}/confirm`);
        setMsg("Appointment confirmed successfully.");
      } else {
        await api.put(`/api/appointments/${id}/status`, { status });
        setMsg(`Appointment updated to ${status.toLowerCase()}.`);
      }
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setErr("Access denied.");
      } else if (e?.response?.status === 401) {
        setErr("Authentication failed. Please sign in again.");
      } else {
        setErr(
          e?.response?.data?.message ||
            "Failed to update status. Please try again."
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(
    () => ({
      ALL: items.length,
      PENDING: items.filter((a) => a.status === "PENDING").length,
      CONFIRMED: items.filter((a) => a.status === "CONFIRMED").length,
      COMPLETED: items.filter((a) => a.status === "COMPLETED").length,
      CANCELLED: items.filter((a) => a.status === "CANCELLED").length,
    }),
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((apt) => {
      if (statusFilter !== "ALL" && apt.status !== statusFilter) return false;
      if (!q) return true;
      const service = (apt.provider?.serviceName || "").toLowerCase();
      const providerName = (apt.provider?.user?.username || "").toLowerCase();
      return service.includes(q) || providerName.includes(q);
    });
  }, [items, statusFilter, searchQuery]);

  const filterTabs = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <AppShell title="My Appointments" breadcrumb="Appointments">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              My Appointments
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review upcoming sessions, confirm pending bookings, or cancel appointments.
            </p>
          </div>
          <Link
            to="/providers"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <FiCalendar className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        <FeedbackBanner variant="error" message={err} onDismiss={() => setErr("")} />
        <FeedbackBanner variant="success" message={msg} onDismiss={() => setMsg("")} />

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    active
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label} ({counts[tab.key]})
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by service or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FiCalendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-display font-semibold text-slate-900">
              {items.length === 0
                ? "No appointments scheduled yet"
                : "No appointments match your filter"}
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              {items.length === 0
                ? "Browse our directory of service providers to book your first session."
                : "Try selecting a different status filter or clearing your search."}
            </p>
            {items.length === 0 ? (
              <Link
                to="/providers"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                  <tr>
                    <th className="text-left px-6 py-3">Service</th>
                    <th className="text-left px-6 py-3">Provider</th>
                    <th className="text-left px-6 py-3">Date & Time</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((apt) => {
                    const dt = apt.appointmentDate || apt.availability?.availableDate;
                    const isMutable =
                      apt.status !== "CANCELLED" && apt.status !== "COMPLETED";
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {apt.provider?.serviceName || "Service"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {apt.provider?.user?.username || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-slate-600 tabular-nums whitespace-nowrap">
                          {dt ? dayjs(dt).format("MMM D, YYYY · h:mm A") : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={apt.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isMutable ? (
                            <div className="inline-flex items-center gap-2">
                              {apt.status === "PENDING" && (
                                <button
                                  type="button"
                                  disabled={busyId === apt.id}
                                  onClick={() => updateStatus(apt.id, "CONFIRMED")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                                >
                                  <FiCheck className="w-3.5 h-3.5" />
                                  <span>Confirm</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={busyId === apt.id}
                                onClick={() => updateStatus(apt.id, "CANCELLED")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 disabled:opacity-50 transition-colors"
                              >
                                <FiX className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
