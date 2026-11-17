import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import dayjs from "dayjs";
import AppShell from "../components/AppShell";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiBriefcase,
  FiDollarSign,
} from "react-icons/fi";

export default function BookAppointment() {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const location = useLocation();
  const { userId, token, role } = useSelector((state) => state.auth);

  const [provider, setProvider] = useState(location.state?.provider || null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadProviderAndAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      if (!provider) {
        const providerRes = await api.get(`/api/providers/${providerId}`);
        setProvider(providerRes.data);
      }
      const availabilitiesRes = await api.get(
        `/api/availabilities/provider/${providerId}`
      );
      const slots = (availabilitiesRes.data || []).sort(
        (a, b) => new Date(a.availableDate) - new Date(b.availableDate)
      );
      setAvailabilities(slots);
      if (slots.length > 0) {
        setSelectedDate(dayjs(slots[0].availableDate).format("YYYY-MM-DD"));
      } else {
        setSelectedDate("");
      }
    } catch {
      setErr("Failed to load provider information.");
    } finally {
      setLoading(false);
    }
  }, [providerId, provider]);

  useEffect(() => {
    if (!token) {
      navigate("/login", {
        state: { from: `/book-appointment/${providerId}` },
      });
      return;
    }

    if (role !== "USER") {
      setErr("Only client accounts can book appointments.");
      setLoading(false);
      return;
    }

    loadProviderAndAvailabilities();
  }, [providerId, token, role, navigate, loadProviderAndAvailabilities]);

  // Group slots by YYYY-MM-DD for clear date + time selection
  const dateGroups = useMemo(() => {
    const groups = new Map();
    for (const slot of availabilities) {
      const key = dayjs(slot.availableDate).format("YYYY-MM-DD");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(slot);
    }
    return groups;
  }, [availabilities]);

  const dateKeys = useMemo(() => Array.from(dateGroups.keys()), [dateGroups]);
  const slotsForSelectedDate = useMemo(
    () => (selectedDate ? dateGroups.get(selectedDate) || [] : []),
    [dateGroups, selectedDate]
  );

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    if (!userId || !token) {
      setErr("Please sign in to book appointments.");
      return;
    }

    setBookingLoading(true);
    setErr("");
    setMsg("");

    try {
      const payload = {
        user: { id: Number(userId) },
        provider: { id: Number(provider.id) },
        availability: { id: Number(selectedSlot.id) },
        appointmentDate: selectedSlot.availableDate,
      };

      const res = await api.post("/api/appointments", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setBookingConfirmed(res.data);
      setSelectedSlot(null);
      setMsg("Your appointment has been booked and is awaiting confirmation.");
      await loadProviderAndAvailabilities();
    } catch (error) {
      let errorMessage = "Booking failed. Please try again.";
      if (error?.response?.status === 403) {
        errorMessage = "Access denied. Only client accounts can book slots.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again.";
      } else if (error?.response?.status === 400) {
        errorMessage =
          error?.response?.data?.message || "Invalid booking details.";
      } else if (error?.response?.status === 409) {
        errorMessage =
          "This time slot was just booked. Please select another available time.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setErr(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Book Appointment" breadcrumb="Book Appointment">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="lg:col-span-7 h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!provider) {
    return (
      <AppShell title="Provider Not Found" breadcrumb="Book Appointment">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h1 className="text-xl font-display font-bold text-slate-900 mb-2">
            Provider not found
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            We couldn&apos;t find the service provider you requested.
          </p>
          <button
            type="button"
            onClick={() => navigate("/providers")}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to providers
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Book Appointment" breadcrumb="Book Appointment">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate("/providers")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to providers</span>
        </button>

        <FeedbackBanner variant="error" message={err} onDismiss={() => setErr("")} />
        <FeedbackBanner variant="success" message={msg} onDismiss={() => setMsg("")} />

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Provider Summary */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="h-48 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden">
              {provider.profileImage ? (
                <img
                  src={provider.profileImage}
                  alt={provider.serviceName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <FiBriefcase className="w-10 h-10 mb-2" />
                  <span className="text-xs font-medium text-slate-500">
                    {provider.serviceName}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">
                  {provider.serviceName || "Service Provider"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Provided by{" "}
                  <span className="font-medium text-slate-700">
                    {provider.user?.username || "Provider"}
                  </span>
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {provider.description || "No service description provided."}
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-sm text-slate-600">
                {provider.phoneNumber && (
                  <div className="flex items-center gap-2.5">
                    <FiPhone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="tabular-nums">{provider.phoneNumber}</span>
                  </div>
                )}
                {(provider.address || provider.city || provider.state) && (
                  <div className="flex items-start gap-2.5">
                    <FiMapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {[provider.address, provider.city, provider.state, provider.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {provider.servicePricing && (
                  <div className="flex items-center gap-2.5">
                    <FiDollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Service fee:{" "}
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        ${provider.servicePricing}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Column: Interactive Slot Picker & Review */}
          <div className="lg:col-span-7 space-y-6">
            {bookingConfirmed && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-base font-display font-semibold text-emerald-900">
                      Appointment Request Submitted
                    </h2>
                    <p className="text-sm text-emerald-800 mt-1">
                      Scheduled for{" "}
                      <span className="font-semibold tabular-nums">
                        {dayjs(bookingConfirmed.appointmentDate).format(
                          "dddd, MMM D, YYYY [at] h:mm A"
                        )}
                      </span>
                      . You can confirm or manage this booking from your appointments page.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        to="/appointments"
                        className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        View My Appointments
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBookingConfirmed(null)}
                        className="px-4 py-2 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Book Another Slot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-900">
                  Select Date & Time
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Choose an available date first, then pick your preferred time slot.
                </p>
              </div>

              {availabilities.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
                  <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    No open slots right now
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    This provider has no unbooked time slots available. Please check back later or explore other providers.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: Date Picker */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2.5">
                      1. Available dates
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dateKeys.map((dateKey) => {
                        const active = selectedDate === dateKey;
                        const count = dateGroups.get(dateKey)?.length || 0;
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateKey);
                              setSelectedSlot(null);
                            }}
                            className={`px-3.5 py-2.5 rounded-lg border text-left transition-colors ${
                              active
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            <div className="text-xs font-semibold tabular-nums">
                              {dayjs(dateKey).format("ddd, MMM D")}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 tabular-nums ${
                                active ? "text-indigo-100" : "text-slate-500"
                              }`}
                            >
                              {count} {count === 1 ? "slot" : "slots"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Time Slot Grid */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2.5">
                      2. Open times on{" "}
                      <span className="text-slate-800 font-semibold">
                        {dayjs(selectedDate).format("MMMM D, YYYY")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {slotsForSelectedDate.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium tabular-nums transition-colors ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 border-indigo-600 ring-1 ring-indigo-600"
                                : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                            }`}
                          >
                            <FiClock className="w-4 h-4 shrink-0" />
                            <span>{dayjs(slot.availableDate).format("h:mm A")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Pre-Confirmation Review Summary */}
                  {selectedSlot && (
                    <div className="pt-5 border-t border-slate-200 space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500">
                          3. Booking summary
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Service: </span>
                            <span className="font-medium text-slate-900">
                              {provider.serviceName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Provider: </span>
                            <span className="font-medium text-slate-900">
                              {provider.user?.username || "Provider"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Date & Time: </span>
                            <span className="font-medium text-slate-900 tabular-nums">
                              {dayjs(selectedSlot.availableDate).format(
                                "MMM D, YYYY · h:mm A"
                              )}
                            </span>
                          </div>
                          {provider.servicePricing && (
                            <div>
                              <span className="text-slate-500">Fee: </span>
                              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                                ${provider.servicePricing}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(null)}
                          className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel selection
                        </button>
                        <button
                          type="button"
                          disabled={bookingLoading || role !== "USER"}
                          onClick={confirmBooking}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {bookingLoading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Confirm & Book Appointment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
