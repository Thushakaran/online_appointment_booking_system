import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import dayjs from "dayjs";
import VideoBackground from "../components/VideoBackground";

export default function BookAppointment() {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const location = useLocation();
  const { userId, token, role } = useSelector((state) => state.auth);

  const [provider, setProvider] = useState(location.state?.provider || null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", {
        state: { from: `/book-appointment/${providerId}` },
      });
      return;
    }

    if (role !== "USER") {
      setErr("Only users can book appointments");
      return;
    }

    loadProviderAndAvailabilities();
  }, [providerId, token, role, navigate]);

  const loadProviderAndAvailabilities = async () => {
    try {
      setLoading(true);

      // If we don't have provider data from navigation state, fetch it
      if (!provider) {
        const providerRes = await api.get(`/api/providers/${providerId}`);
        setProvider(providerRes.data);
      }

      // Fetch availabilities for this provider
      const availabilitiesRes = await api.get(
        `/api/availabilities/provider/${providerId}`
      );
      setAvailabilities(availabilitiesRes.data || []);
    } catch (error) {
      console.error("Error loading provider data:", error);
      setErr("Failed to load provider information");
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (slot) => {
    if (!userId || !token) {
      setErr("Please login to book appointments");
      return;
    }

    setBookingLoading(true);
    setErr("");
    setMsg("");

    try {
      const payload = {
        user: { id: Number(userId) },
        provider: { id: Number(provider.id) },
        availability: { id: Number(slot.id) },
        appointmentDate: slot.availableDate,
      };

      const response = await api.post("/api/appointments", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setMsg("Successfully booked appointment!");

      // Refresh availabilities to remove the booked slot
      await loadProviderAndAvailabilities();

      // Clear message after 5 seconds
      setTimeout(() => setMsg(""), 5000);
    } catch (error) {
      console.error("Booking error:", error);

      let errorMessage = "Booking failed. Please try again.";

      if (error?.response?.status === 403) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error?.response?.status === 400) {
        errorMessage =
          "Bad request. " + (error?.response?.data?.message || "Invalid data.");
      } else if (error?.response?.status === 409) {
        errorMessage =
          "This time slot is already booked. Please choose another slot.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErr(errorMessage);
      setTimeout(() => setErr(""), 8000);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <VideoBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-white">
                Loading provider information...
              </span>
            </div>
          </div>
        </div>
      </VideoBackground>
    );
  }

  if (!provider) {
    return (
      <VideoBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 text-center">
            <div className="text-white text-lg mb-4">Provider not found</div>
            <button
              onClick={() => navigate("/providers")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Providers
            </button>
          </div>
        </div>
      </VideoBackground>
    );
  }

  return (
    <VideoBackground>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/providers")}
          className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Providers
        </button>

        {/* Error and Success Messages */}
        {err && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {err}
          </div>
        )}
        {msg && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
            {msg}
          </div>
        )}

        {/* Provider Details */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Provider Image */}
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              {provider.profileImage ? (
                <img
                  src={provider.profileImage}
                  alt={provider.user?.username || "Provider"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-20 h-20 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>

            {/* Provider Information */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-heading-h1 mb-2">
                {provider.user?.username || "Unknown Provider"}
              </h1>
              <p className="text-white/80 text-xl mb-3 font-medium">
                {provider.serviceName || "Service Provider"}
              </p>
              <p className="text-white/60 mb-4 leading-relaxed">
                {provider.description || "No description available."}
              </p>

              {/* Contact and Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {provider.phoneNumber && (
                  <div className="flex items-center text-white/70">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {provider.phoneNumber}
                  </div>
                )}

                {provider.city && provider.state && (
                  <div className="flex items-center text-white/70">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {provider.city}, {provider.state}
                  </div>
                )}
              </div>

              {/* Pricing */}
              {provider.servicePricing && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">
                    Service Pricing
                  </h3>
                  <p className="text-white/80">{provider.servicePricing}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-heading-h2 mb-6">
            Available Appointment Slots
          </h2>

          {availabilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/60 text-lg mb-4">
                No available slots at the moment.
              </div>
              <p className="text-white/40 text-sm">
                Please check back later or contact the provider directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilities.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="text-white mb-3">
                    <div className="font-medium">
                      {slot.availableDate
                        ? dayjs(slot.availableDate).format("MMM DD, YYYY")
                        : "Date: N/A"}
                    </div>
                    <div className="text-sm text-white/70">
                      {slot.availableDate
                        ? dayjs(slot.availableDate).format("h:mm A")
                        : "Time: N/A"}
                    </div>
                  </div>

                  <button
                    onClick={() => bookAppointment(slot)}
                    disabled={bookingLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    {bookingLoading ? "Booking..." : "Book This Slot"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VideoBackground>
  );
}
