import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";

export default function Profile() {
  const navigate = useNavigate();
  const { token, role, userId } = useSelector((state) => state.auth);
  const [me, setMe] = useState(null);
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
  });

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

        // Fetch appointments for statistics
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
          } catch (providerErr) {
            // Provider profile doesn't exist yet
          }
        }
      } catch (e) {
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
      setIsEditing(false);
      setErr("");
    } catch {
      setErr("Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErr("New passwords don't match");
      return;
    }

    try {
      const response = await api.post("/api/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.message) {
        setSuccess("Password changed successfully!");
        setErr("");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setErr(error.response?.data?.error || "Failed to change password");
    }
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const upcoming = appointments.filter(
      (apt) => apt.status === "CONFIRMED"
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;

    return { total, completed, upcoming, cancelled };
  };

  if (loading)
    return (
      <VideoBackground>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </VideoBackground>
    );

  if (err || success)
    return (
      <VideoBackground>
        <div className="max-w-6xl mx-auto py-8 px-4">
          {err && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-4">
              {err}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-4">
              {success}
            </div>
          )}
        </div>
      </VideoBackground>
    );

  if (!me)
    return (
      <VideoBackground>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-white text-xl">No profile data found</div>
        </div>
      </VideoBackground>
    );

  // Provider Profile View (keep existing implementation)
  if (role === "PROVIDER") {
    return (
      <VideoBackground>
        <div className="min-h-[calc(100vh-5rem)] py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600/80 to-blue-800/80 backdrop-blur-sm px-6 py-8 text-white">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
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
                  <div>
                    <h1 className="text-3xl font-bold">
                      {provider?.serviceName || "Provider Profile"}
                    </h1>
                    <p className="text-blue-100 mt-1">{me.email}</p>
                    {provider?.profileCompleted && (
                      <span className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm mt-2">
                        Profile Complete
                      </span>
                    )}
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => navigate("/provider-setup")}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                    >
                      {provider ? "Edit Profile" : "Complete Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    About
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {provider?.description ||
                      "No description available. Please complete your profile to add a description."}
                  </p>
                </div>

                {/* Professional Information */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Professional Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {provider?.specializations && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Specializations
                        </h3>
                        <p className="text-gray-700">
                          {provider.specializations}
                        </p>
                      </div>
                    )}
                    {provider?.experience && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Experience
                        </h3>
                        <p className="text-gray-700">{provider.experience}</p>
                      </div>
                    )}
                    {provider?.education && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Education
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {provider.education}
                        </p>
                      </div>
                    )}
                    {provider?.certifications && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Certifications & Licenses
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {provider.certifications}
                        </p>
                      </div>
                    )}
                    {provider?.languages && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Languages
                        </h3>
                        <p className="text-gray-700">{provider.languages}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services & Pricing */}
                {(provider?.servicePricing || provider?.acceptedInsurance) && (
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Services & Pricing
                    </h2>
                    {provider?.servicePricing && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Pricing
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {provider.servicePricing}
                        </p>
                      </div>
                    )}
                    {provider?.acceptedInsurance && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Accepted Insurance
                        </h3>
                        <p className="text-gray-700">
                          {provider.acceptedInsurance}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    {provider?.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                        <span className="text-gray-700">
                          {provider.phoneNumber}
                        </span>
                      </div>
                    )}
                    {provider?.address && (
                      <div className="flex items-start space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-400 mt-0.5"
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
                        <div className="text-gray-700">
                          <div>{provider.address}</div>
                          {provider.city && provider.state && (
                            <div>
                              {provider.city}, {provider.state}{" "}
                              {provider.zipCode}
                            </div>
                          )}
                          {provider.country && <div>{provider.country}</div>}
                        </div>
                      </div>
                    )}
                    {provider?.website && (
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                          />
                        </svg>
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Hours */}
                {provider?.businessHours && (
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Business Hours
                    </h2>
                    <p className="text-gray-700">{provider.businessHours}</p>
                  </div>
                )}

                {/* Social Media */}
                {(provider?.linkedin ||
                  provider?.twitter ||
                  provider?.facebook) && (
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Social Media
                    </h2>
                    <div className="space-y-3">
                      {provider?.linkedin && (
                        <a
                          href={provider.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {provider?.twitter && (
                        <a
                          href={provider.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-blue-400 hover:text-blue-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          <span>Twitter</span>
                        </a>
                      )}
                      {provider?.facebook && (
                        <a
                          href={provider.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate("/provider-dashboard")}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/provider-setup")}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {provider ? "Edit Profile" : "Complete Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VideoBackground>
    );
  }

  // Enhanced Regular User Profile View
  const stats = getAppointmentStats();

  return (
    <VideoBackground>
      <div className="min-h-[calc(100vh-5rem)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 backdrop-blur-sm px-6 py-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
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
                <div>
                  <h1 className="text-3xl font-bold">{me.username}</h1>
                  <p className="text-purple-100 mt-1">{me.email}</p>
                  <p className="text-purple-200 text-sm mt-1">
                    Member since {new Date().getFullYear()}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-2 mb-8">
            <div className="flex space-x-2">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "activity", label: "Activity", icon: "📅" },
                { id: "settings", label: "Settings", icon: "⚙️" },
                { id: "security", label: "Security", icon: "🔒" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white/30 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {activeTab === "overview" && (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        {stats.total}
                      </div>
                      <div className="text-white/80 text-sm">
                        Total Appointments
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {stats.completed}
                      </div>
                      <div className="text-white/80 text-sm">Completed</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {stats.upcoming}
                      </div>
                      <div className="text-white/80 text-sm">Upcoming</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-red-400 mb-2">
                        {stats.cancelled}
                      </div>
                      <div className="text-white/80 text-sm">Cancelled</div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Profile Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white/80 font-medium">
                          Username
                        </label>
                        <p className="text-white text-lg">{me.username}</p>
                      </div>
                      <div>
                        <label className="text-white/80 font-medium">
                          Email
                        </label>
                        <p className="text-white text-lg">{me.email}</p>
                      </div>
                      <div>
                        <label className="text-white/80 font-medium">
                          Role
                        </label>
                        <p className="text-white text-lg">{me.role}</p>
                      </div>
                      <div>
                        <label className="text-white/80 font-medium">
                          User ID
                        </label>
                        <p className="text-white text-lg">{me.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Recent Activity
                    </h2>
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.slice(0, 5).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 bg-white/10 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                Appointment with{" "}
                                {appointment.provider?.serviceName ||
                                  "Provider"}
                              </p>
                              <p className="text-white/70 text-sm">
                                {new Date(
                                  appointment.appointmentDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "COMPLETED"
                                  ? "bg-green-500/20 text-green-400"
                                  : appointment.status === "CONFIRMED"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : appointment.status === "CANCELLED"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/70">No recent appointments</p>
                    )}
                  </div>
                </>
              )}

              {activeTab === "activity" && (
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Appointment History
                  </h2>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-white/10 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-lg">
                              {appointment.provider?.serviceName || "Provider"}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "COMPLETED"
                                  ? "bg-green-500/20 text-green-400"
                                  : appointment.status === "CONFIRMED"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : appointment.status === "CANCELLED"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span>{" "}
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleTimeString()}
                            </div>
                            {appointment.notes && (
                              <div className="md:col-span-2">
                                <span className="font-medium">Notes:</span>{" "}
                                {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/70">
                      No appointment history found
                    </p>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Profile Settings
                  </h2>

                  {isEditing ? (
                    <div className="space-y-6">
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
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex space-x-4">
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
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-white/80 font-medium mb-2">
                          Username
                        </label>
                        <p className="text-white text-lg">{me.username}</p>
                      </div>
                      <div>
                        <label className="block text-white/80 font-medium mb-2">
                          Email
                        </label>
                        <p className="text-white text-lg">{me.email}</p>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}

                  {/* Notification Preferences */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(preferences).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <label className="text-white/80 capitalize">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                          <button
                            onClick={() =>
                              setPreferences({ ...preferences, [key]: !value })
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              value ? "bg-purple-600" : "bg-gray-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                value
                                  ? "transform translate-x-6"
                                  : "transform translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Account Security
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Account Information
                    </h3>
                    <div className="space-y-4 text-white/80">
                      <div>
                        <span className="font-medium">Account Created:</span>{" "}
                        {new Date().toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Login:</span>{" "}
                        {new Date().toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Account Status:</span>
                        <span className="text-green-400 ml-2">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/providers")}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Browse Providers
                  </button>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    My Appointments
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              {/* Account Summary */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Account Summary
                </h2>
                <div className="space-y-3 text-white/80">
                  <div className="flex justify-between">
                    <span>Total Appointments:</span>
                    <span className="text-white font-medium">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-green-400 font-medium">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming:</span>
                    <span className="text-blue-400 font-medium">
                      {stats.upcoming}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled:</span>
                    <span className="text-red-400 font-medium">
                      {stats.cancelled}
                    </span>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Help & Support
                </h2>
                <div className="space-y-3">
                  <button className="w-full text-left text-white/80 hover:text-white transition-colors">
                    📞 Contact Support
                  </button>
                  <button className="w-full text-left text-white/80 hover:text-white transition-colors">
                    ❓ FAQ
                  </button>
                  <button className="w-full text-left text-white/80 hover:text-white transition-colors">
                    📖 User Guide
                  </button>
                  <button className="w-full text-left text-white/80 hover:text-white transition-colors">
                    🐛 Report Bug
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
