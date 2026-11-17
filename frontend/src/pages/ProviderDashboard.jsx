import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiUser,
  FiMail,
  FiMapPin,
  FiSettings,
  FiCheckCircle,
} from "react-icons/fi";

const BOOKING_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function ProviderDashboard() {
  const { token, role, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({ availableDate: "" });
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editForm, setEditForm] = useState({ availableDate: "" });
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [updatingAptId, setUpdatingAptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  const sortAppointments = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const isPendingA = a.status === "PENDING";
      const isPendingB = b.status === "PENDING";
      if (isPendingA !== isPendingB) return isPendingA ? -1 : 1;
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
      try {
        const providerRes = await api.get("/api/providers/me");
        setProvider(providerRes.data);
        setProfileExists(true);
        setError("");
      } catch (providerErr) {
        if (
          providerErr.response?.status === 404 ||
          providerErr.response?.status === 403
        ) {
          try {
            const allProvidersRes = await api.get("/api/providers");
            const currentUser = user || localStorage.getItem("username");
            const matched = (allProvidersRes.data || []).find(
              (p) => p.user && p.user.username === currentUser
            );
            if (matched) {
              setProvider(matched);
              setProfileExists(true);
              setError("");
            } else {
              setProfileExists(false);
            }
          } catch {
            setProfileExists(false);
          }
        } else {
          setProfileExists(false);
          setError("Failed to fetch provider profile. Please try again.");
        }
      }

      try {
        const [availabilitiesRes, appointmentsRes] = await Promise.all([
          api.get("/api/availabilities/my-availabilities"),
          api.get("/api/appointments/my-appointments"),
        ]);
        setAvailabilities(availabilitiesRes.data || []);
        setAppointments(sortAppointments(appointmentsRes.data || []));
      } catch {
        setAvailabilities([]);
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, sortAppointments]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.availableDate) return;
    try {
      setError("");
      setMessage("");
      await api.post("/api/availabilities", availabilityForm);
      setAvailabilityForm({ availableDate: "" });
      setMessage("Availability slot added.");
      fetchProviderData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add availability slot.");
    }
  };

  const handleStartEdit = (availability) => {
    setEditingAvailability(availability.id);
    setEditForm({
      availableDate: dayjs(availability.availableDate).format("YYYY-MM-DDTHH:mm"),
    });
  };

  const handleCancelEdit = () => {
    setEditingAvailability(null);
    setEditForm({ availableDate: "" });
  };

  const handleUpdateAvailability = async (availabilityId) => {
    try {
      setError("");
      setMessage("");
      await api.put(`/api/availabilities/${availabilityId}`, editForm);
      setMessage("Availability slot updated.");
      setEditingAvailability(null);
      setEditForm({ availableDate: "" });
      fetchProviderData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability.");
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm("Delete this availability slot?")) return;
    try {
      setError("");
      setMessage("");
      await api.delete(`/api/availabilities/${availabilityId}`);
      setMessage("Availability slot deleted.");
      fetchProviderData();
    } catch (err) {
      let errorMessage = "Failed to delete availability.";
      if (err.response?.status === 403) {
        errorMessage = "Access denied. You can only delete your own availabilities.";
      } else if (err.response?.status === 404) {
        errorMessage = "Availability slot not found.";
      } else if (err.response?.status === 400) {
        errorMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data?.message || "Cannot delete an availability with bookings.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      setUpdatingAptId(appointmentId);
      setError("");
      setMessage("");
      await api.put(`/api/appointments/${appointmentId}/status`, { status });
      setMessage(`Appointment marked as ${status.toLowerCase()}.`);
      fetchProviderData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update appointment status."
      );
    } finally {
      setUpdatingAptId(null);
    }
  };

  const sortedAvailabilities = useMemo(() => {
    return [...availabilities].sort(
      (a, b) => new Date(a.availableDate) - new Date(b.availableDate)
    );
  }, [availabilities]);

  const stats = useMemo(
    () => ({
      totalSlots: availabilities.length,
      openSlots: availabilities.filter((a) => !a.isBooked).length,
      totalBookings: appointments.length,
      pendingCount: appointments.filter((a) => a.status === "PENDING").length,
      confirmedCount: appointments.filter((a) => a.status === "CONFIRMED").length,
      completedCount: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelledCount: appointments.filter((a) => a.status === "CANCELLED").length,
    }),
    [availabilities, appointments]
  );

  const filteredAppointments = useMemo(() => {
    if (bookingFilter === "ALL") return appointments;
    return appointments.filter((a) => a.status === bookingFilter);
  }, [appointments, bookingFilter]);

  return (
    <AppShell title="Provider Dashboard" breadcrumb="Overview">
      {loading ? (
        <div className="space-y-6">
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      ) : !profileExists ? (
        <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <FiSettings className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold text-slate-900">
            Complete Your Business Profile
          </h1>
          <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
            Set up your service name, description, location, and pricing before publishing availability slots and accepting client bookings.
          </p>
          <button
            type="button"
            onClick={() => navigate("/provider-setup")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span>Set up provider profile</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <FeedbackBanner
            variant="error"
            message={error}
            onDismiss={() => setError("")}
          />
          <FeedbackBanner
            variant="success"
            message={message}
            onDismiss={() => setMessage("")}
          />

          {/* Provider Header Bar */}
          {provider && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden shrink-0">
                  {provider.profileImage ? (
                    <img
                      src={provider.profileImage}
                      alt={provider.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-display font-bold">
                      {(provider.serviceName || "P").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl font-display font-bold text-slate-900 truncate">
                      {provider.serviceName || "Provider Workspace"}
                    </h1>
                    <StatusBadge status="PROVIDER" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    {provider.user?.email && <span>{provider.user.email}</span>}
                    {(provider.city || provider.state) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                          {[provider.city, provider.state].filter(Boolean).join(", ")}
                        </span>
                      </>
                    )}
                    {provider.servicePricing && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-medium text-slate-700">
                          {/^\d+(\.\d+)?$/.test(String(provider.servicePricing).trim())
                            ? `$${provider.servicePricing} / session`
                            : provider.servicePricing}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/provider-setup")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit business profile</span>
              </button>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">Total Slots</div>
              <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
                {stats.totalSlots}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">Available Slots</div>
              <div className="text-2xl font-display font-bold text-emerald-600 mt-1 tabular-nums">
                {stats.openSlots}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">Total Bookings</div>
              <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
                {stats.totalBookings}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">Pending Requests</div>
              <div className="text-2xl font-display font-bold text-amber-600 mt-1 tabular-nums">
                {stats.pendingCount}
              </div>
            </div>
          </div>

          {/* Client Bookings & Status Management */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-900">
                  Client Bookings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review incoming appointment requests and update session statuses.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {BOOKING_FILTERS.map((f) => {
                  const count =
                    f.key === "ALL"
                      ? stats.totalBookings
                      : f.key === "PENDING"
                      ? stats.pendingCount
                      : f.key === "CONFIRMED"
                      ? stats.confirmedCount
                      : f.key === "COMPLETED"
                      ? stats.completedCount
                      : stats.cancelledCount;
                  const active = bookingFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setBookingFilter(f.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        active
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f.label}{" "}
                      <span className="ml-1 text-slate-400 tabular-nums">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center">
                <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-800">
                  {bookingFilter === "ALL"
                    ? "No bookings yet"
                    : `No ${bookingFilter.toLowerCase()} bookings`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Client appointments will appear here once an available slot is booked.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                      <th className="py-3 pr-4">Client</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <FiUser className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {apt.user?.username || "Client"}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <FiMail className="w-3 h-3 text-slate-400" />
                                <span>{apt.user?.email || "No email"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                          {apt.appointmentDate
                            ? dayjs(apt.appointmentDate).format("MMM D, YYYY · h:mm A")
                            : "Not scheduled"}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={apt.status} />
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {apt.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingAptId === apt.id}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(apt.id, "CONFIRMED")
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 whitespace-nowrap"
                                >
                                  <FiCheck className="w-3.5 h-3.5" />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingAptId === apt.id}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(apt.id, "CANCELLED")
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 disabled:opacity-50 whitespace-nowrap"
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}
                            {apt.status === "CONFIRMED" && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingAptId === apt.id}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(apt.id, "COMPLETED")
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-50 whitespace-nowrap"
                                >
                                  <FiCheckCircle className="w-3.5 h-3.5" />
                                  <span>Complete</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingAptId === apt.id}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(apt.id, "CANCELLED")
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 disabled:opacity-50 whitespace-nowrap"
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}
                            {(apt.status === "COMPLETED" || apt.status === "CANCELLED") && (
                              <span className="text-xs text-slate-400">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Availability & Schedule Management */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="mb-5">
              <h2 className="text-lg font-display font-semibold text-slate-900">
                Schedule & Time Slots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish open appointment windows for clients to book.
              </p>
            </div>

            {/* Add Availability Bar */}
            <form
              onSubmit={handleAddAvailability}
              className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6"
            >
              <div className="flex-1">
                <label
                  htmlFor="new-slot-datetime"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  New availability date & time
                </label>
                <input
                  id="new-slot-datetime"
                  type="datetime-local"
                  value={availabilityForm.availableDate}
                  onChange={(e) =>
                    setAvailabilityForm({ availableDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add time slot</span>
              </button>
            </form>

            {sortedAvailabilities.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                <FiClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">
                  No availability slots added yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Use the date & time selector above to create your first bookable slot.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAvailabilities.map((availability) => (
                  <div
                    key={availability.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between gap-4"
                  >
                    {editingAvailability === availability.id ? (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-slate-700">
                          Update date & time
                        </label>
                        <input
                          type="datetime-local"
                          value={editForm.availableDate}
                          onChange={(e) =>
                            setEditForm({ availableDate: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateAvailability(availability.id)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 tabular-nums">
                              {dayjs(availability.availableDate).format("ddd, MMM D, YYYY")}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 tabular-nums">
                              <FiClock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {dayjs(availability.availableDate).format("h:mm A")}
                              </span>
                            </div>
                          </div>
                          <StatusBadge
                            status={availability.isBooked ? "BOOKED" : "AVAILABLE"}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(availability)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAvailability(availability.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
