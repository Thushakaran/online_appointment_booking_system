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
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import AlertBanner from "../components/ui/AlertBanner";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/toastContext";

const TIME_PRESETS = [
  { label: "09:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:30 AM", value: "11:30" },
  { label: "01:00 PM", value: "13:00" },
  { label: "02:30 PM", value: "14:30" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:30 PM", value: "17:30" },
];

const BOOKING_FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function ProviderDashboard() {
  const toast = useToast();
  const { token, role, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState(() => ({
    date: dayjs().add(1, "day").format("YYYY-MM-DD"),
    time: "10:00",
    repeatWeeks: 1,
  }));
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editForm, setEditForm] = useState({ availableDate: "" });
  const [bookingFilter, setBookingFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        const [availRes, apptRes, reviewsRes] = await Promise.all([
          api.get("/api/availabilities/my-availabilities"),
          api.get("/api/appointments/my-appointments"),
          foundProvider?.id
            ? api
                .get(`/api/reviews/provider/${foundProvider.id}`)
                .catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);
        setAvailabilities(availRes.data || []);
        setAppointments(sortAppointments(apptRes.data || []));
        setReviews(reviewsRes.data || []);
      } catch {
        setAvailabilities([]);
        setAppointments([]);
        setReviews([]);
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

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.date || !availabilityForm.time) {
      toast.error("Please select both a date and start time.");
      return;
    }
    const baseDateTime = dayjs(`${availabilityForm.date}T${availabilityForm.time}`);
    if (!baseDateTime.isValid()) {
      toast.error("Invalid date or time selected.");
      return;
    }
    try {
      setError("");
      const repeats = Math.min(12, Math.max(1, Number(availabilityForm.repeatWeeks) || 1));
      await Promise.all(
        Array.from({ length: repeats }, (_, week) =>
          api.post("/api/availabilities", {
            availableDate: baseDateTime.add(week, "week").format("YYYY-MM-DDTHH:mm:ss"),
          })
        )
      );
      setAvailabilityForm((prev) => ({ ...prev, repeatWeeks: 1 }));
      toast.success(
        repeats > 1
          ? `Added ${repeats} weekly availability slots.`
          : "Availability slot added."
      );
      await fetchProviderData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add availability slot.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleConfirmDeleteAvailability = async () => {
    if (!deleteSlotTarget) return;
    try {
      setDeletingSlot(true);
      setError("");
      await api.delete(`/api/availabilities/${deleteSlotTarget.id}`);
      toast.success("Availability slot removed.");
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
      toast.error(msg);
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
      await api.put(`/api/availabilities/${availabilityId}`, editForm);
      toast.success("Availability slot updated.");
      setEditingAvailability(null);
      setEditForm({ availableDate: "" });
      await fetchProviderData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update slot.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, nextStatus) => {
    try {
      setUpdatingBookingId(appointmentId);
      setError("");
      await api.put(`/api/appointments/${appointmentId}/status`, nextStatus, {
        headers: { "Content-Type": "text/plain" },
      });
      toast.success(`Appointment marked as ${nextStatus.toLowerCase()}.`);
      await fetchProviderData();
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error;
      const msg =
        apiMessage ||
        (err.response?.status === 403
          ? "You cannot change this appointment because it is not assigned to your provider account."
          : err.response?.status === 401
            ? "Your session has expired. Please sign in again."
            : "Unable to update appointment status. Check the selected appointment and try again.");
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const stats = useMemo(() => {
    const openSlots = availabilities.filter((a) => !a.isBooked).length;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;
    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0;
    return {
      totalSlots: availabilities.length,
      openSlots,
      pending,
      confirmed,
      completed,
      totalBookings: appointments.length,
      reviewCount,
      averageRating,
    };
  }, [availabilities, appointments, reviews]);

  const reviewsByAppointment = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      if (r.appointmentId) map[r.appointmentId] = r;
    });
    return map;
  }, [reviews]);

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
          id: `appointment-${a.id}-${a.status}`,
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
    {
      sectionId: "reviews",
      label: "Client Reviews",
      icon: FiStar,
      count: stats.reviewCount,
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
        <AlertBanner
          variant="error"
          message={error}
          onDismiss={() => setError("")}
        />

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
                  <p className="text-xs text-slate-500 mt-0.5 truncate flex flex-wrap items-center gap-x-2">
                    <span>
                      {[provider?.city, provider?.state].filter(Boolean).join(", ")}
                      {provider?.servicePricing
                        ? ` · $${provider.servicePricing}`
                        : ""}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium tabular-nums">
                      <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-400" aria-hidden="true" />
                      {stats.reviewCount > 0
                        ? `${stats.averageRating.toFixed(1)} (${stats.reviewCount} ${
                            stats.reviewCount === 1 ? "review" : "reviews"
                          })`
                        : "No reviews yet"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection("availability")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeSection === "bookings"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Bookings ({appointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("reviews")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeSection === "reviews"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Reviews ({stats.reviewCount})
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

                {/* Visual Schedule Builder Form */}
                <form
                  onSubmit={handleAddAvailability}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 space-y-1.5">
                      <label
                        htmlFor="new-slot-date"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Date
                      </label>
                      <input
                        id="new-slot-date"
                        type="date"
                        required
                        min={dayjs().format("YYYY-MM-DD")}
                        value={availabilityForm.date}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { label: "Today", offset: 0 },
                          { label: "Tomorrow", offset: 1 },
                          { label: "+2 days", offset: 2 },
                          { label: "Next week", offset: 7 },
                        ].map((d) => {
                          const targetVal = dayjs()
                            .add(d.offset, "day")
                            .format("YYYY-MM-DD");
                          const active = availabilityForm.date === targetVal;
                          return (
                            <button
                              key={d.label}
                              type="button"
                              onClick={() =>
                                setAvailabilityForm((prev) => ({
                                  ...prev,
                                  date: targetVal,
                                }))
                              }
                              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label
                        htmlFor="new-slot-time"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Start Time
                      </label>
                      <input
                        id="new-slot-time"
                        type="time"
                        required
                        value={availabilityForm.time}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1.5">
                      <label
                        htmlFor="repeat-weeks"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Repeat Weekly (1–12)
                      </label>
                      <input
                        id="repeat-weeks"
                        type="number"
                        min="1"
                        max="12"
                        value={availabilityForm.repeatWeeks}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            repeatWeeks: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-500 mr-1">
                        Quick times:
                      </span>
                      {TIME_PRESETS.map((preset) => {
                        const active = availabilityForm.time === preset.value;
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() =>
                              setAvailabilityForm((prev) => ({
                                ...prev,
                                time: preset.value,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                              active
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:border-indigo-300"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>
                        {Number(availabilityForm.repeatWeeks) > 1
                          ? `Publish ${Math.min(12, Math.max(1, Number(availabilityForm.repeatWeeks) || 1))} Slots`
                          : "Publish Slot"}
                      </span>
                    </button>
                  </div>

                  {availabilityForm.date && availabilityForm.time && (
                    <p className="text-xs text-slate-500 tabular-nums">
                      Preview:{" "}
                      <span className="font-medium text-slate-700">
                        {dayjs(`${availabilityForm.date}T${availabilityForm.time}`).format(
                          "ddd, MMM D, YYYY [at] h:mm A"
                        )}
                      </span>
                      {Number(availabilityForm.repeatWeeks) > 1
                        ? ` (repeating weekly for ${Math.min(
                            12,
                            Math.max(1, Number(availabilityForm.repeatWeeks) || 1)
                          )} weeks)`
                        : ""}
                    </p>
                  )}
                </form>

                {availabilities.length === 0 ? (
                  <EmptyState
                    dashed
                    icon={FiClock}
                    title="No availability slots published"
                    description="Choose a date and time above so clients can book appointments."
                  />
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
                      const bookingReview = reviewsByAppointment[appt.id];
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

                            {bookingReview && (
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-slate-800">
                                    Client Review
                                  </span>
                                  <div
                                    className="inline-flex items-center gap-0.5"
                                    aria-label={`${bookingReview.rating} out of 5 stars`}
                                  >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FiStar
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= bookingReview.rating
                                            ? "text-amber-500 fill-amber-400"
                                            : "text-slate-200 fill-slate-100"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {bookingReview.comment && (
                                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                    {bookingReview.comment}
                                  </p>
                                )}
                              </div>
                            )}
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

            {/* Client Reviews Section */}
            {(activeSection === "overview" || activeSection === "reviews") && (
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Client Reviews
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified feedback submitted by clients after completed appointments.
                    </p>
                  </div>
                  {stats.reviewCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="inline-flex items-center gap-0.5" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(stats.averageRating)
                                ? "text-amber-500 fill-amber-400"
                                : "text-slate-200 fill-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-900 font-mono tabular-nums">
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        ({stats.reviewCount}{" "}
                        {stats.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <FiMessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">
                      No customer reviews yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reviews left by clients after completed sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center shrink-0">
                              {(review.reviewer || "C").slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {review.reviewer}
                              </p>
                              <p className="text-xs text-slate-400 tabular-nums">
                                Appointment #{review.appointmentId} ·{" "}
                                {dayjs(review.createdAt).format("MMM D, YYYY")}
                              </p>
                            </div>
                          </div>
                          <div
                            className="inline-flex items-center gap-1 shrink-0"
                            aria-label={`${review.rating} out of 5 stars`}
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating
                                    ? "text-amber-500 fill-amber-400"
                                    : "text-slate-200 fill-slate-100"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs font-mono font-semibold text-slate-700 tabular-nums">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 leading-relaxed pl-10">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
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
