import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiGrid,
  FiClock,
  FiCalendar,
  FiSettings,
  FiUser,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiAward,
  FiMail,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";

const BOOKING_FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function ProviderDashboard() {
  const { token, role, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({ availableDate: "" });
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editForm, setEditForm] = useState({ availableDate: "" });
  const [bookingFilter, setBookingFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  const [deleteSlotTarget, setDeleteSlotTarget] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const sortAppointments = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    const priority = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    return [...list].sort((a, b) => {
      const pa = priority[a.status] ?? 4;
      const pb = priority[b.status] ?? 4;
      if (pa !== pb) return pa - pb;
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });
  }, []);

  useEffect(() => {
    if (!token || role !== "PROVIDER") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const fetchProviderData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      let foundProvider = null;

      try {
        const providerRes = await api.get("/api/providers/me");
        foundProvider = providerRes.data;
      } catch (providerErr) {
        if (
          providerErr.response?.status === 404 ||
          providerErr.response?.status === 403
        ) {
          try {
            const allProvidersRes = await api.get("/api/providers");
            const currentUser = user || localStorage.getItem("username");
            foundProvider = (allProvidersRes.data || []).find(
              (p) => p.user && p.user.username === currentUser
            );
          } catch {
            foundProvider = null;
          }
        }
      }

      if (foundProvider) {
        setProvider(foundProvider);
        setProfileExists(true);
      } else {
        setProvider(null);
        setProfileExists(false);
      }

      try {
        const [availRes, apptRes] = await Promise.all([
          api.get("/api/availabilities/my-availabilities"),
          api.get("/api/appointments/my-appointments"),
        ]);
        setAvailabilities(availRes.data || []);
        setAppointments(sortAppointments(apptRes.data || []));
      } catch {
        setAvailabilities([]);
        setAppointments([]);
      }
      setError("");
    } catch {
      setError("Failed to fetch provider workspace data.");
    } finally {
      setLoading(false);
    }
  }, [token, sortAppointments, user]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.availableDate) return;
    try {
      setError("");
      setMessage("");
      await api.post("/api/availabilities", availabilityForm);
      setAvailabilityForm({ availableDate: "" });
      setMessage("Availability slot added.");
      await fetchProviderData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add availability slot.");
    }
  };

  const handleConfirmDeleteAvailability = async () => {
    if (!deleteSlotTarget) return;
    try {
      setDeletingSlot(true);
      setError("");
      setMessage("");
      await api.delete(`/api/availabilities/${deleteSlotTarget.id}`);
      setMessage("Availability slot removed.");
      setDeleteSlotTarget(null);
      await fetchProviderData();
    } catch (err) {
      let msg = "Failed to delete availability slot.";
      if (err.response?.status === 400) {
        msg =
          err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Cannot delete a slot with an active booking.");
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setDeleteSlotTarget(null);
    } finally {
      setDeletingSlot(false);
    }
  };

  const handleStartEdit = (availability) => {
    setEditingAvailability(availability.id);
    setEditForm({
      availableDate: dayjs(availability.availableDate).format("YYYY-MM-DDTHH:mm"),
    });
  };

  const handleUpdateAvailability = async (availabilityId) => {
    try {
      setError("");
      setMessage("");
      await api.put(`/api/availabilities/${availabilityId}`, editForm);
      setMessage("Availability slot updated.");
      setEditingAvailability(null);
      setEditForm({ availableDate: "" });
      await fetchProviderData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update slot.");
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, nextStatus) => {
    try {
      setUpdatingBookingId(appointmentId);
      setError("");
      setMessage("");
      await api.put(`/api/appointments/${appointmentId}/status`, nextStatus, {
        headers: { "Content-Type": "text/plain" },
      });
      setMessage(`Appointment marked as ${nextStatus.toLowerCase()}.`);
      await fetchProviderData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update appointment status."
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const stats = useMemo(() => {
    const openSlots = availabilities.filter((a) => !a.isBooked).length;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;
    return {
      totalSlots: availabilities.length,
      openSlots,
      pending,
      confirmed,
      completed,
      totalBookings: appointments.length,
    };
  }, [availabilities, appointments]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "ALL") return appointments;
    return appointments.filter((a) => a.status === bookingFilter);
  }, [appointments, bookingFilter]);

  const notifications = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
        .slice(0, 6)
        .map((a) => ({
          id: `prov-appt-${a.id}`,
          title: `${a.user?.username || "Client"} · ${a.status}`,
          detail: dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A"),
        })),
    [appointments]
  );

  const navItems = [
    { sectionId: "overview", label: "Overview", icon: FiGrid },
    {
      sectionId: "availability",
      label: "Availability Slots",
      icon: FiClock,
      count: stats.openSlots,
    },
    {
      sectionId: "bookings",
      label: "Client Bookings",
      icon: FiCalendar,
      count: stats.pending > 0 ? stats.pending : stats.totalBookings,
    },
    { to: "/provider-setup", label: "Service & Pricing", icon: FiSettings },
    { to: "/profile", label: "Account Profile", icon: FiUser },
  ];

  return (
    <DashboardShell
      title="Provider Workspace"
      breadcrumb="Dashboard"
      customNavItems={navItems}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      notifications={notifications}
      actions={
        <Link
          to="/provider-setup"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <FiSettings className="w-4 h-4" />
          <span>{profileExists ? "Edit Service" : "Complete Setup"}</span>
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

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss notice"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        ) : !profileExists ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Complete your provider profile
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Add your service name, description, practice address, and pricing so
              clients can discover you and book open slots.
            </p>
            <button
              type="button"
              onClick={() => navigate("/provider-setup")}
              className="mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Set Up Service Profile
            </button>
          </div>
        ) : (
          <>
            {/* Provider Profile Summary Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center shrink-0">
                  {provider?.profileImage ? (
                    <img
                      src={provider.profileImage}
                      alt={provider.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-indigo-600">
                      {(provider?.serviceName || "PR").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-slate-900 truncate">
                      {provider?.serviceName}
                    </h2>
                    <StatusBadge
                      status={availabilities.length > 0 ? "ACTIVE" : "SETUP"}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {[provider?.city, provider?.state].filter(Boolean).join(", ")}
                    {provider?.servicePricing
                      ? ` · $${provider.servicePricing}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection("availability")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSection === "availability"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Manage Slots
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("bookings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSection === "bookings"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Bookings ({appointments.length})
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500">Total Slots</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {stats.totalSlots}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500">
                  Open Availability
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                  {stats.openSlots}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500">
                  Pending Approval
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-600 font-mono tabular-nums">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500">Confirmed</p>
                <p className="mt-2 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
                  {stats.confirmed}
                </p>
              </div>
            </div>

            {/* Availability Section */}
            {(activeSection === "overview" || activeSection === "availability") && (
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Availability Schedule
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish open consultation windows or edit existing times.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {availabilities.length} total slots
                  </span>
                </div>

                {/* Add Availability Form */}
                <form
                  onSubmit={handleAddAvailability}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-end gap-3"
                >
                  <div className="flex-1">
                    <label
                      htmlFor="new-slot-date"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      New Time Slot (Date & Time)
                    </label>
                    <input
                      id="new-slot-date"
                      type="datetime-local"
                      required
                      value={availabilityForm.availableDate}
                      onChange={(e) =>
                        setAvailabilityForm({ availableDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Slot</span>
                  </button>
                </form>

                {availabilities.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <FiClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">
                      No availability slots published
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Add a date and time above so clients can book appointments.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availabilities.map((slot) => {
                      const isEditing = editingAvailability === slot.id;
                      return (
                        <div
                          key={slot.id}
                          className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <label className="block text-xs font-medium text-slate-700">
                                Update Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={editForm.availableDate}
                                onChange={(e) =>
                                  setEditForm({ availableDate: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAvailability(slot.id)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAvailability(null);
                                    setEditForm({ availableDate: "" });
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                                    {dayjs(slot.availableDate).format(
                                      "MMM D, YYYY"
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                                    {dayjs(slot.availableDate).format("h:mm A")}
                                  </p>
                                </div>
                                <StatusBadge
                                  status={slot.isBooked ? "BOOKED" : "AVAILABLE"}
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(slot)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                                >
                                  <FiEdit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteSlotTarget(slot)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Bookings Section */}
            {(activeSection === "overview" || activeSection === "bookings") && (
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Client Bookings
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review client details and update appointment statuses.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {BOOKING_FILTERS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setBookingFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          bookingFilter === f
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {f === "ALL"
                          ? `All (${appointments.length})`
                          : f.charAt(0) + f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">
                      No {bookingFilter === "ALL" ? "" : bookingFilter.toLowerCase()}{" "}
                      bookings found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Client reservations will appear here as slots are booked.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.map((appt) => {
                      const isBusy = updatingBookingId === appt.id;
                      return (
                        <div
                          key={appt.id}
                          className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-mono text-slate-400 tabular-nums">
                                  Booking #{appt.id}
                                </p>
                                <p className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                                  {appt.appointmentDate
                                    ? dayjs(appt.appointmentDate).format(
                                        "MMM D, YYYY · h:mm A"
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                              <StatusBadge status={appt.status} />
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                                <FiUser className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {appt.user?.username || "Client"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {appt.user?.email || "No email provided"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            {appt.status === "PENDING" && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateAppointmentStatus(appt.id, "CONFIRMED")
                                }
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                                <span>Confirm</span>
                              </button>
                            )}
                            {(appt.status === "PENDING" ||
                              appt.status === "CONFIRMED") && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateAppointmentStatus(appt.id, "COMPLETED")
                                }
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                              >
                                <FiAward className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            )}
                            {(appt.status === "PENDING" ||
                              appt.status === "CONFIRMED") && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateAppointmentStatus(appt.id, "CANCELLED")
                                }
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 disabled:opacity-50"
                              >
                                <FiX className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteSlotTarget)}
        title="Delete availability slot?"
        description={
          deleteSlotTarget
            ? `Remove the slot on ${dayjs(deleteSlotTarget.availableDate).format(
                "MMM D, YYYY at h:mm A"
              )}? Active bookings cannot be deleted.`
            : ""
        }
        confirmLabel="Delete Slot"
        cancelLabel="Keep Slot"
        variant="danger"
        loading={deletingSlot}
        onCancel={() => setDeleteSlotTarget(null)}
        onConfirm={handleConfirmDeleteAvailability}
      />
    </DashboardShell>
  );
}
