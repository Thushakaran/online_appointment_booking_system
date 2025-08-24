import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";
import { logout } from "../features/auth/authSlice";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [me, setMe] = useState(null);
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await api.get("/api/users/me");
        setMe(userRes.data);
        setEditForm({
          username: userRes.data.username,
          email: userRes.data.email,
        });

        // Fetch appointments
        try {
          const appointmentsRes = await api.get(
            `/api/appointments/user/${userRes.data.id}`
          );
          setAppointments(appointmentsRes.data);
        } catch {
          console.log("No appointments found or error fetching appointments");
        }

        if (role === "PROVIDER") {
          try {
            const providerRes = await api.get("/api/providers/me");
            setProvider(providerRes.data);
          } catch {
            // Provider profile doesn't exist yet
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setErr("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, navigate]);

  const handleProfileUpdate = async () => {
    try {
      const updatedUser = await api.put(`/api/users/${me.id}`, editForm);
      setMe(updatedUser.data);

      // Check if username was changed
      if (editForm.username !== me.username) {
        // Username changed - JWT token will be invalid, so logout and redirect to login
        setSuccess(
          "Profile updated successfully! Please log in again with your new username."
        );
        setTimeout(() => {
          dispatch(logout());
          navigate("/");
        }, 2000);
        return;
      }

      setIsEditing(false);
      setErr("");
      setSuccess("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);

      // Handle different types of errors
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          setErr(data.error || "Invalid data provided");
        } else if (status === 401) {
          setErr("Authentication failed. Please log in again.");
        } else if (status === 403) {
          setErr("You don't have permission to update this profile.");
        } else if (status === 409) {
          setErr("Username or email already exists.");
        } else {
          setErr(data.error || "Failed to update profile");
        }
      } else if (error.request) {
        setErr("Network error. Please check your connection.");
      } else {
        setErr("An unexpected error occurred. Please try again.");
      }
    }
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const pending = appointments.filter(
      (apt) => apt.status === "PENDING"
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;
    return { total, completed, pending, cancelled };
  };

  if (loading)
    return (
      <VideoBackground>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </VideoBackground>
    );

  return (
    <VideoBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Error and Success Messages */}
          {err && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {err}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {!me ? (
            <div className="text-white text-xl">No profile data found</div>
          ) : (
            <>
              {/* Provider Profile */}
              {role === "PROVIDER" ? (
                <div className="space-y-8">
                  {/* Page Title */}
                  <h1 className="text-4xl font-bold text-heading-h1 mb-8">
                    Provider Profile
                  </h1>

                  {/* User Profile Card - Purple Gradient */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                        {provider?.profileImage ? (
                          <img
                            src={provider.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
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
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-heading-h2">
                          {provider?.serviceName || "Provider Profile"}
                        </h2>
                        <p className="text-purple-100 mt-1">{me.email}</p>
                        <p className="text-purple-200 text-sm mt-1">
                          Member since {new Date().getFullYear()}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button
                          onClick={() => navigate("/provider-setup")}
                          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300"
                        >
                          {provider ? "Edit Profile" : "Complete Profile"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Service Information Card */}
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-heading-h2 mb-6">
                        Service Information
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Service Name
                          </label>
                          <input
                            type="text"
                            value={
                              provider?.serviceName || "Bridal Makeup Artist"
                            }
                            disabled
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Description
                          </label>
                          <textarea
                            value={
                              provider?.description ||
                              "Experienced bridal makeup services with customizable packages for weddings and events."
                            }
                            disabled
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white resize-none"
                          />
                        </div>
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                          Update Info
                        </button>
                      </div>
                    </div>

                    {/* Quick Summary Card */}
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-heading-h2 mb-6">
                        Quick Summary
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            0
                          </div>
                          <div className="text-white/80 text-sm">
                            Total Slots
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            0
                          </div>
                          <div className="text-green-400 text-sm">
                            Available
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            0
                          </div>
                          <div className="text-white/80 text-sm">
                            Total Bookings
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            Active
                          </div>
                          <div className="text-white/80 text-sm">Status</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular User Profile
                <div className="space-y-8">
                  {/* Page Title */}
                  <h1 className="text-4xl font-bold text-heading-h1 mb-8">
                    User Profile
                  </h1>

                  {/* User Profile Card - Purple Gradient */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
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
                        <h2 className="text-2xl font-bold text-heading-h2">
                          {me.username}
                        </h2>
                        <p className="text-purple-100 mt-1">{me.email}</p>
                        <p className="text-purple-200 text-sm mt-1">
                          Member since {new Date().getFullYear()}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300"
                        >
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  {(() => {
                    const stats = getAppointmentStats();
                    return (
                      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-heading-h2 mb-6">
                          Appointment Summary
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                              {stats.total}
                            </div>
                            <div className="text-white/80 text-sm">Total</div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                              {stats.pending}
                            </div>
                            <div className="text-white/80 text-sm">Pending</div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-400 mb-1">
                              {stats.cancelled}
                            </div>
                            <div className="text-white/80 text-sm">
                              Cancelled
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {stats.completed}
                            </div>
                            <div className="text-white/80 text-sm">
                              Completed
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Edit Form */}
                  {isEditing && (
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                      <h2 className="text-xl font-bold text-heading-h2 mb-6">
                        Edit Profile
                      </h2>

                      {/* Warning about username change */}
                      {editForm.username !== me.username && (
                        <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg mb-6">
                          <p className="text-sm">
                            <strong>Note:</strong> Changing your username will
                            require you to log in again with your new username.
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                username: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={handleProfileUpdate}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </VideoBackground>
  );
}
