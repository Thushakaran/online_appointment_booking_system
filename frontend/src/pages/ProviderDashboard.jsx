import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import dayjs from "dayjs";
import videoBackground from "../assets/video.mp4";

export default function ProviderDashboard() {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ serviceName: "", description: "" });
  const [availabilityForm, setAvailabilityForm] = useState({
    availableDate: "",
  });
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editForm, setEditForm] = useState({ availableDate: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  // Redirect if not logged in or not a provider
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (role !== "PROVIDER") {
      navigate("/");
    }
  }, [token, role, navigate]);

  // Fetch logged-in provider and availabilities
  const fetchProviderData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [providerRes, availabilitiesRes, appointmentsRes] =
        await Promise.all([
          api.get("/api/providers/me"),
          api.get("/api/availabilities/my-availabilities"),
          api.get("/api/appointments/my-appointments"),
        ]);
      setProvider(providerRes.data);
      setAvailabilities(availabilitiesRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setForm({
        serviceName: providerRes.data?.serviceName || "",
        description: providerRes.data?.description || "",
      });
      setProfileExists(true);
      setError("");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        // Provider profile doesn't exist
        setProfileExists(false);
        setError("Please complete your provider profile setup first.");
      } else {
        setError("Failed to fetch provider info. Make sure you are logged in.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, [token]);

  // Update provider
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!provider) return;
    try {
      setError("");
      setMessage("");
      await api.put(`/api/providers/${provider.id}`, form);
      setMessage("Provider info updated successfully!");
      fetchProviderData(); // Refresh after update
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to update provider info."
      );
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  // Add availability
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      await api.post("/api/availabilities", {
        availableDate: availabilityForm.availableDate,
      });
      setAvailabilityForm({ availableDate: "" });
      setMessage("Availability added successfully!");
      fetchProviderData(); // Refresh availabilities
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add availability.");
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  // Delete availability
  const handleDeleteAvailability = async (availabilityId) => {
    if (window.confirm("Are you sure you want to delete this availability?")) {
      try {
        setError("");
        setMessage("");
        console.log("=== Delete Availability Frontend Debug ===");
        console.log("Deleting availability with ID:", availabilityId);
        console.log("Current token:", token);
        console.log("Current provider:", provider);
        console.log("Current availabilities:", availabilities);

        // Log the specific availability being deleted
        const availabilityToDelete = availabilities.find(
          (a) => a.id === availabilityId
        );
        console.log("Availability to delete:", availabilityToDelete);

        const response = await api.delete(
          `/api/availabilities/${availabilityId}`
        );
        console.log("Delete response:", response);

        setMessage("Availability deleted successfully!");
        fetchProviderData(); // Refresh availabilities
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        console.error("=== Delete Availability Error ===");
        console.error("Delete availability error:", err);
        console.error("Error response:", err.response);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        console.error("Error message:", err.response?.data?.message);

        let errorMessage = "Failed to delete availability.";

        if (err.response?.status === 403) {
          errorMessage =
            err.response?.data?.message ||
            "Access denied. You can only delete your own availabilities.";
        } else if (err.response?.status === 404) {
          errorMessage = "Availability not found.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
        // Clear error after 5 seconds
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  // Start editing availability
  const handleStartEdit = (availability) => {
    setEditingAvailability(availability.id);
    // Convert the date to the format expected by datetime-local input
    const dateForInput = dayjs(availability.availableDate).format(
      "YYYY-MM-DDTHH:mm"
    );
    setEditForm({ availableDate: dateForInput });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAvailability(null);
    setEditForm({ availableDate: "" });
  };

  // Update availability
  const handleUpdateAvailability = async (availabilityId) => {
    try {
      setError("");
      setMessage("");
      await api.put(`/api/availabilities/${availabilityId}`, {
        availableDate: editForm.availableDate,
      });
      setMessage("Availability updated successfully!");
      setEditingAvailability(null);
      setEditForm({ availableDate: "" });
      fetchProviderData(); // Refresh availabilities
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update availability.");
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const goToSetup = () => {
    navigate("/provider-setup");
  };

  if (loading)
    return (
      <div className="min-h-[calc(100vh-5rem)] relative flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );

  // Show setup prompt if profile doesn't exist
  if (!profileExists) {
    return (
      <div className="min-h-[calc(100vh-5rem)] relative">
        {/* Full Page Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
        >
          <source src={videoBackground} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay for readability */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

        <div className="relative z-20 max-w-4xl mx-auto p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-heading-h1">
              Provider Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
            >
              Logout
            </button>
          </header>

          <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-semibold text-heading-h2 mb-4">
              Complete Your Provider Profile
            </h2>
            <p className="text-yellow-100 mb-6 text-lg">
              You need to set up your provider profile before you can start
              managing appointments.
            </p>
            <button
              onClick={goToSetup}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Set Up Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] relative">
      {/* Full Page Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoBackground} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

      <div className="relative z-20 max-w-6xl mx-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-heading-h1">
            Provider Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
          >
            Logout
          </button>
        </header>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 mb-6 text-green-200">
            {message}
          </div>
        )}

        {provider ? (
          <>
            {/* Provider Profile Header - Matching User Profile Style */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 backdrop-blur-sm px-6 py-8 text-white flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                  <svg
                    className="w-12 h-12 text-white"
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
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-heading-h1">
                    {provider?.serviceName || "Provider Profile"}
                  </h1>
                  <p className="text-purple-100 mt-1">
                    {provider?.user?.email || "N/A"}
                  </p>
                  <p className="text-purple-200 text-sm mt-1">
                    Member since {new Date().getFullYear()}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => navigate("/provider-setup")}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Provider Info Card */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-2xl font-bold text-heading-h2 mb-4 border-b border-white/30 pb-2">
                    Service Information
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Service Name
                      </label>
                      <input
                        type="text"
                        placeholder="Service Name"
                        value={form.serviceName}
                        onChange={(e) =>
                          setForm({ ...form, serviceName: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows="3"
                      />
                    </div>
                  </form>
                </div>

                {/* Availability Management */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-2xl font-bold text-heading-h2 mb-4 border-b border-white/30 pb-2">
                    Manage Availabilities
                  </h2>

                  {/* Add Availability Form */}
                  <form
                    onSubmit={handleAddAvailability}
                    className="mb-8 flex gap-4"
                  >
                    <input
                      type="datetime-local"
                      value={availabilityForm.availableDate}
                      onChange={(e) =>
                        setAvailabilityForm({ availableDate: e.target.value })
                      }
                      className="flex-1 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Add Availability
                    </button>
                  </form>

                  {/* Availabilities List */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-heading-h3">
                      Your Availabilities
                    </h3>
                    {availabilities.length === 0 ? (
                      <p className="text-gray-300 text-center py-8">
                        No availabilities added yet.
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {availabilities.map((availability) => (
                          <div
                            key={availability.id}
                            className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6"
                          >
                            {editingAvailability === availability.id ? (
                              // Edit mode
                              <div className="space-y-4">
                                <input
                                  type="datetime-local"
                                  value={editForm.availableDate}
                                  onChange={(e) =>
                                    setEditForm({
                                      availableDate: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                  required
                                />
                                <div className="flex gap-3">
                                  <button
                                    onClick={() =>
                                      handleUpdateAvailability(availability.id)
                                    }
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-gray-600/80 transition-all duration-300 border border-gray-400/30"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xl font-semibold text-white">
                                    {dayjs(availability.availableDate).format(
                                      "YYYY-MM-DD HH:mm"
                                    )}
                                  </p>
                                  <p className="text-gray-300">
                                    Status:{" "}
                                    <span
                                      className={`font-semibold ${
                                        availability.isBooked
                                          ? "text-red-400"
                                          : "text-green-400"
                                      }`}
                                    >
                                      {availability.isBooked
                                        ? "Booked"
                                        : "Available"}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() =>
                                      handleStartEdit(availability)
                                    }
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteAvailability(availability.id)
                                    }
                                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookings Management */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-2xl font-bold text-heading-h2 mb-4 border-b border-white/30 pb-2">
                    My Bookings
                  </h2>

                  <div>
                    <h3 className="text-xl font-bold mb-6 text-heading-h3">
                      User Bookings
                    </h3>
                    {appointments.length === 0 ? (
                      <p className="text-gray-300 text-center py-8">
                        No bookings yet.
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xl font-semibold text-white">
                                    {appointment.user?.username ||
                                      "Unknown User"}
                                  </p>
                                  <p className="text-gray-300">
                                    {appointment.user?.email || "No email"}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    appointment.status === "PENDING"
                                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                                      : appointment.status === "CONFIRMED"
                                      ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                      : appointment.status === "CANCELLED"
                                      ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                      : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                                  }`}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                              <div className="text-gray-300">
                                <p>
                                  <span className="font-semibold">Date:</span>{" "}
                                  {dayjs(appointment.appointmentDate).format(
                                    "YYYY-MM-DD HH:mm"
                                  )}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Booked on:
                                  </span>{" "}
                                  {dayjs(appointment.createdAt).format(
                                    "YYYY-MM-DD HH:mm"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Quick Summary */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-bold text-heading-h2 mb-4 border-b border-white/30 pb-2">
                    Quick Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {availabilities.length}
                      </div>
                      <div className="text-white/80 text-sm">Total Slots</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {availabilities.filter((a) => !a.isBooked).length}
                      </div>
                      <div className="text-white/80 text-sm">Available</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {appointments.length}
                      </div>
                      <div className="text-white/80 text-sm">
                        Total Bookings
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {provider?.serviceName ? "Active" : "Setup"}
                      </div>
                      <div className="text-white/80 text-sm">Status</div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-bold text-heading-h2 mb-4 border-b border-white/30 pb-2">
                    About
                  </h2>
                  <p className="text-white/90 leading-relaxed">
                    {provider?.description ||
                      "No description available. Please complete your profile."}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 text-center">
            <p className="text-white text-xl">No provider data found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
