import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import dayjs from "dayjs";
import VideoBackground from "../components/VideoBackground";

export default function ProviderDashboard() {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
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
      const [providerRes, availabilitiesRes] = await Promise.all([
        api.get("/api/providers/me"),
        api.get("/api/availabilities/my-availabilities"),
      ]);
      setProvider(providerRes.data);
      setAvailabilities(availabilitiesRes.data || []);
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

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  // Show setup prompt if profile doesn't exist
  if (!profileExists) {
    return (
      <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-5rem)]">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
            Complete Your Provider Profile
          </h2>
          <p className="text-yellow-700 mb-6">
            You need to set up your provider profile before you can start
            managing appointments.
          </p>
          <button
            onClick={goToSetup}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      {provider ? (
        <>
          {/* Provider Info */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome, {provider?.user?.username || "Provider"}
            </h2>
            <p>
              <strong>Email:</strong> {provider?.user?.email || "N/A"}
            </p>
            <p>
              <strong>Service Name:</strong> {provider?.serviceName || "N/A"}
            </p>
            <p>
              <strong>Description:</strong> {provider?.description || "N/A"}
            </p>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Service Name"
                value={form.serviceName}
                onChange={(e) =>
                  setForm({ ...form, serviceName: e.target.value })
                }
                className="border rounded p-2"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border rounded p-2"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update Info
              </button>
            </form>
          </div>

          {/* Availability Management */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Manage Availabilities
            </h2>

            {/* Add Availability Form */}
            <form onSubmit={handleAddAvailability} className="mb-6 flex gap-4">
              <input
                type="datetime-local"
                value={availabilityForm.availableDate}
                onChange={(e) =>
                  setAvailabilityForm({ availableDate: e.target.value })
                }
                className="border rounded p-2 flex-1"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Availability
              </button>
            </form>

            {/* Availabilities List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Your Availabilities
              </h3>
              {availabilities.length === 0 ? (
                <p className="text-gray-500">No availabilities added yet.</p>
              ) : (
                <div className="grid gap-4">
                  {availabilities.map((availability) => (
                    <div
                      key={availability.id}
                      className="border rounded-lg p-4"
                    >
                      {editingAvailability === availability.id ? (
                        // Edit mode
                        <div className="flex flex-col gap-3">
                          <input
                            type="datetime-local"
                            value={editForm.availableDate}
                            onChange={(e) =>
                              setEditForm({ availableDate: e.target.value })
                            }
                            className="border rounded p-2"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateAvailability(availability.id)
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {dayjs(availability.availableDate).format(
                                "YYYY-MM-DD HH:mm"
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Status:{" "}
                              {availability.isBooked ? "Booked" : "Available"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(availability)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAvailability(availability.id)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
        </>
      ) : (
        <p>No provider data found.</p>
      )}
    </div>
  );
}
