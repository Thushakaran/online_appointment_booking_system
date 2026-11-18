import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase,
  FiStar,
} from "react-icons/fi";
import api from "../api/axios";
import AlertBanner from "../components/ui/AlertBanner";
import { useToast } from "../components/ui/toastContext";

export default function BookAppointment() {
  const toast = useToast();
  const navigate = useNavigate();
  const { providerId } = useParams();
  const location = useLocation();
  const { userId, token, role } = useSelector((state) => state.auth);

  const [provider, setProvider] = useState(location.state?.provider || null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [err, setErr] = useState("");
  const [imgFailed, setImgFailed] = useState(false);
  const [reviews, setReviews] = useState([]);

  const loadProviderAndAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      if (!provider) {
        const providerRes = await api.get(`/api/providers/${providerId}`);
        setProvider(providerRes.data);
      }
      const [availabilitiesRes, reviewsRes] = await Promise.all([
        api.get(`/api/availabilities/provider/${providerId}`),
        api.get(`/api/reviews/provider/${providerId}`).catch(() => ({ data: [] })),
      ]);
      const slots = (availabilitiesRes.data || []).sort(
        (a, b) => new Date(a.availableDate) - new Date(b.availableDate)
      );
      setAvailabilities(slots);
      setReviews(reviewsRes.data || []);
      if (slots.length > 0) {
        const firstDay = dayjs(slots[0].availableDate).format("YYYY-MM-DD");
        setSelectedDateKey((prev) => prev || firstDay);
      } else {
        setSelectedDateKey("");
      }
    } catch {
      setErr("Failed to load provider details and availability.");
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

  const groupedByDate = useMemo(() => {
    const map = {};
    availabilities.forEach((slot) => {
      if (!slot.availableDate) return;
      const key = dayjs(slot.availableDate).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });
    return map;
  }, [availabilities]);

  const dateKeys = useMemo(() => Object.keys(groupedByDate).sort(), [groupedByDate]);
  const slotsForSelectedDate = groupedByDate[selectedDateKey] || [];

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    if (!userId || !token) {
      setErr("Please sign in to book appointments.");
      return;
    }

    setBookingLoading(true);
    setErr("");

    try {
      const payload = {
        user: { id: Number(userId) },
        provider: { id: Number(provider.id) },
        availability: { id: Number(selectedSlot.id) },
        appointmentDate: selectedSlot.availableDate,
      };

      const response = await api.post("/api/appointments", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setConfirmedBooking({
        ...(response.data || {}),
        slotDate: selectedSlot.availableDate,
      });
      setSelectedSlot(null);
      toast.success("Appointment requested successfully.");
      await loadProviderAndAvailabilities();
    } catch (error) {
      let errorMessage = "Booking failed. Please try again.";
      if (error?.response?.status === 403) {
        errorMessage = "Access denied. Only client accounts can book appointments.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again.";
      } else if (error?.response?.status === 409) {
        errorMessage = "This time slot was just booked. Please select another slot.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setErr(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-44 bg-white border border-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-72 bg-white border border-slate-200 rounded-xl" />
            <div className="lg:col-span-5 h-72 bg-white border border-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center">
          <FiAlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-900">Provider not found</h1>
          <p className="text-sm text-slate-500 mt-1">
            {err || "We could not locate this service provider."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/providers")}
            className="mt-5 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Back to Providers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate("/providers")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Providers</span>
        </button>

        <AlertBanner
          variant="error"
          message={err}
          onDismiss={() => setErr("")}
        />

        {/* Confirmed Success Banner */}
        {confirmedBooking && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold text-emerald-950">
                  Appointment Requested Successfully
                </h2>
                <p className="text-sm text-emerald-800 mt-0.5 tabular-nums">
                  {provider.serviceName} with {provider.user?.username || "Provider"} on{" "}
                  {dayjs(confirmedBooking.slotDate).format("dddd, MMM D, YYYY [at] h:mm A")}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/appointments"
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                View My Appointments
              </Link>
            </div>
          </div>
        )}

        {/* Provider Summary Header Card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
              {provider.profileImage && !imgFailed ? (
                <img
                  src={provider.profileImage}
                  alt={provider.serviceName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiBriefcase className="w-8 h-8 text-indigo-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    {provider.serviceName}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Provided by{" "}
                    <span className="font-medium text-slate-800">
                      {provider.user?.username || "Specialist"}
                    </span>
                  </p>
                </div>
                {provider.servicePricing && (
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">Rate</span>
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      ${provider.servicePricing}
                    </span>
                  </div>
                )}
              </div>

              {provider.description && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {provider.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                {provider.phoneNumber && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{provider.phoneNumber}</span>
                  </span>
                )}
                {(provider.city || provider.state) && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {[provider.address, provider.city, provider.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Booking Workspace: Slot Selection + Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Date & Time Selection */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              1. Select Date & Time Slot
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose an available date below to view open time windows.
            </p>

            {dateKeys.length === 0 ? (
              <div className="mt-6 py-12 text-center border border-dashed border-slate-200 rounded-xl">
                <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">
                  No open slots available right now
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Please check back later or choose another provider.
                </p>
              </div>
            ) : (
              <>
                {/* Date Picker Strip */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {dateKeys.map((dayKey) => {
                    const active = selectedDateKey === dayKey;
                    const count = groupedByDate[dayKey]?.length || 0;
                    return (
                      <button
                        key={dayKey}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(dayKey);
                          setSelectedSlot(null);
                        }}
                        className={`px-3.5 py-2.5 rounded-lg border text-left transition-colors ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-semibold tabular-nums">
                          {dayjs(dayKey).format("ddd, MMM D")}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 tabular-nums ${
                            active ? "text-indigo-100" : "text-slate-500"
                          }`}
                        >
                          {count} open
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots Grid */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Available times for{" "}
                    <span className="text-slate-900 font-semibold">
                      {dayjs(selectedDateKey).format("MMMM D, YYYY")}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {slotsForSelectedDate.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium font-mono tabular-nums transition-colors ${
                            isSelected
                              ? "bg-indigo-50 text-indigo-700 border-indigo-600 ring-1 ring-indigo-600"
                              : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                          }`}
                        >
                          <FiClock className="w-3.5 h-3.5 shrink-0" />
                          <span>{dayjs(slot.availableDate).format("h:mm A")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Right: Booking Summary & Confirmation */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              2. Review & Confirm
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your appointment details before submitting.
            </p>

            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-slate-500">Service</dt>
                <dd className="font-medium text-slate-900 text-right">
                  {provider.serviceName}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-slate-500">Provider</dt>
                <dd className="font-medium text-slate-900 text-right">
                  {provider.user?.username || "Specialist"}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-slate-500">Date</dt>
                <dd className="font-medium text-slate-900 text-right tabular-nums">
                  {selectedSlot
                    ? dayjs(selectedSlot.availableDate).format("MMM D, YYYY")
                    : "Not selected"}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-slate-500">Time</dt>
                <dd className="font-medium text-slate-900 text-right font-mono tabular-nums">
                  {selectedSlot
                    ? dayjs(selectedSlot.availableDate).format("h:mm A")
                    : "Not selected"}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-slate-500">Pricing</dt>
                <dd className="font-semibold text-slate-900 text-right font-mono tabular-nums">
                  {provider.servicePricing ? `$${provider.servicePricing}` : "Standard"}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={!selectedSlot || bookingLoading || role !== "USER"}
              onClick={handleConfirmBooking}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bookingLoading
                ? "Confirming Appointment..."
                : selectedSlot
                ? "Confirm Booking"
                : "Select a Time Slot First"}
            </button>
          </aside>
        </div>

        {/* Client Reviews Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Client Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified feedback from completed consultations
              </p>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="inline-flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avg =
                      reviews.reduce((sum, r) => sum + r.rating, 0) /
                      reviews.length;
                    return (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(avg)
                            ? "text-amber-500 fill-amber-400"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  {(
                    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                  ).toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No client reviews yet for this service.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center shrink-0">
                        {(review.reviewer || "C").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {review.reviewer}
                        </p>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {dayjs(review.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                    <div
                      className="inline-flex items-center gap-1"
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
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 leading-relaxed pl-9">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
