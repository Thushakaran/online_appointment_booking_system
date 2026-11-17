import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role, user } = useSelector((state) => state.auth);

  const [me, setMe] = useState(null);
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErr, setPasswordErr] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const userRes = await api.get("/api/users/me");
      setMe(userRes.data);
      setEditForm({
        username: userRes.data.username || "",
        email: userRes.data.email || "",
      });

      try {
        if (role === "PROVIDER") {
          const appointmentsRes = await api.get("/api/appointments/my-appointments");
          setAppointments(appointmentsRes.data || []);
        } else {
          const appointmentsRes = await api.get(
            `/api/appointments/user/${userRes.data.id}`
          );
          setAppointments(appointmentsRes.data || []);
        }
      } catch {
        setAppointments([]);
      }

      if (role === "PROVIDER") {
        try {
          const providerRes = await api.get("/api/providers/me");
          setProvider(providerRes.data);
        } catch (providerErr) {
          if (
            providerErr.response?.status === 404 ||
            providerErr.response?.status === 403
          ) {
            try {
              const allProvidersRes = await api.get("/api/providers");
              const currentUsername = user || userRes.data?.username;
              const matched = (allProvidersRes.data || []).find(
                (p) => p.user && p.user.username === currentUsername
              );
              setProvider(matched || null);
            } catch {
              setProvider(null);
            }
          }
        }

        try {
          const availabilitiesRes = await api.get(
            "/api/availabilities/my-availabilities"
          );
          setAvailabilities(availabilitiesRes.data || []);
        } catch {
          setAvailabilities([]);
        }
      }
    } catch {
      setErr("Failed to load profile information.");
    } finally {
      setLoading(false);
    }
  }, [token, role, user]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [token, navigate, fetchData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!me) return;
    setErr("");
    setSuccess("");
    setSavingProfile(true);

    try {
      const updatedUser = await api.put(`/api/users/${me.id}`, editForm);
      const previousUsername = me.username;
      setMe(updatedUser.data);

      if (editForm.username.trim() !== previousUsername) {
        setSuccess(
          "Profile updated! Because your username changed, you will be signed out to log in with your new username."
        );
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 2000);
        return;
      }

      setIsEditing(false);
      setSuccess("Account details updated successfully.");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          setErr(data?.error || "Invalid profile details provided.");
        } else if (status === 401) {
          setErr("Authentication failed. Please sign in again.");
        } else if (status === 403) {
          setErr("You do not have permission to update this profile.");
        } else if (status === 409) {
          setErr("That username or email is already registered.");
        } else {
          setErr(data?.error || "Failed to update profile.");
        }
      } else if (error.request) {
        setErr("Network error. Please check your connection.");
      } else {
        setErr("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordErr("Please fill in your current and new password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordErr("New password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await api.post("/api/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordErr(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  const openSlotsCount = availabilities.filter((a) => !a.isBooked).length;

  return (
    <AppShell title="Profile & Security" breadcrumb="Profile">
      <div className="space-y-6">
        <FeedbackBanner variant="error" message={err} onDismiss={() => setErr("")} />
        <FeedbackBanner
          variant="success"
          message={success}
          onDismiss={() => setSuccess("")}
        />

        {loading ? (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : !me ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <h1 className="text-lg font-display font-semibold text-slate-900">
              No profile data found
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Please sign out and log back in to reload your account details.
            </p>
          </div>
        ) : (
          <>
            {/* Profile Overview Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden shrink-0">
                    {role === "PROVIDER" && provider?.profileImage ? (
                      <img
                        src={provider.profileImage}
                        alt={provider.serviceName || me.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-display font-bold">
                        {(me.username || "U").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 truncate">
                        {role === "PROVIDER" && provider?.serviceName
                          ? provider.serviceName
                          : me.username}
                      </h1>
                      <StatusBadge status={me.role || role} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                      <FiMail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{me.email}</span>
                    </p>
                    {role === "PROVIDER" && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Account username: <span className="font-medium text-slate-700">{me.username}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing((prev) => !prev);
                      setEditForm({
                        username: me.username || "",
                        email: me.email || "",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>{isEditing ? "Cancel Edit" : "Edit Account"}</span>
                  </button>
                  {role === "PROVIDER" && (
                    <button
                      type="button"
                      onClick={() => navigate("/provider-setup")}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      <FiBriefcase className="w-4 h-4" />
                      <span>{provider ? "Edit Business Profile" : "Complete Setup"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Summary KPI Strip */}
            {role === "PROVIDER" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Total Time Slots</div>
                  <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
                    {availabilities.length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Open Slots</div>
                  <div className="text-2xl font-display font-bold text-emerald-600 mt-1 tabular-nums">
                    {openSlotsCount}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Total Bookings</div>
                  <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
                    {appointments.length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Profile Status</div>
                  <div className="text-2xl font-display font-bold text-indigo-600 mt-1">
                    {provider
                      ? availabilities.length > 0
                        ? "Active"
                        : "Ready"
                      : "Incomplete"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Total Appointments</div>
                  <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
                    {appointmentStats.total}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Pending</div>
                  <div className="text-2xl font-display font-bold text-amber-600 mt-1 tabular-nums">
                    {appointmentStats.pending}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">
                    Confirmed & Completed
                  </div>
                  <div className="text-2xl font-display font-bold text-emerald-600 mt-1 tabular-nums">
                    {appointmentStats.confirmed + appointmentStats.completed}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-medium text-slate-500">Cancelled</div>
                  <div className="text-2xl font-display font-bold text-rose-600 mt-1 tabular-nums">
                    {appointmentStats.cancelled}
                  </div>
                </div>
              </div>
            )}

            {/* Main Two-Column Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Information / Edit Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Account Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage your sign-in username and email address.
                    </p>
                  </div>
                  <FiUser className="w-5 h-5 text-slate-400" />
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {editForm.username.trim() !== me.username && (
                      <FeedbackBanner
                        variant="warning"
                        message="Changing your username will end your current session and require signing in with your new username."
                      />
                    )}

                    <div>
                      <label
                        htmlFor="profile-username"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Username
                      </label>
                      <input
                        id="profile-username"
                        type="text"
                        required
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-email"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>{savingProfile ? "Saving..." : "Save changes"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="divide-y divide-slate-100 text-sm">
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Username</dt>
                      <dd className="font-medium text-slate-900">{me.username}</dd>
                    </div>
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Email</dt>
                      <dd className="font-medium text-slate-900">{me.email}</dd>
                    </div>
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Account Role</dt>
                      <dd>
                        <StatusBadge status={me.role || role} />
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              {/* Password & Security Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Password & Security
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your account password to keep your account secure.
                    </p>
                  </div>
                  <FiLock className="w-5 h-5 text-slate-400" />
                </div>

                <FeedbackBanner
                  variant="error"
                  message={passwordErr}
                  onDismiss={() => setPasswordErr("")}
                  className="mb-4"
                />
                <FeedbackBanner
                  variant="success"
                  message={passwordSuccess}
                  onDismiss={() => setPasswordSuccess("")}
                  className="mb-4"
                />

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((p) => ({ ...p, current: !p.current }))
                        }
                        aria-label={
                          showPasswords.current
                            ? "Hide current password"
                            : "Show current password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showPasswords.next ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Min 6 characters"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, next: !p.next }))
                          }
                          aria-label={
                            showPasswords.next
                              ? "Hide new password"
                              : "Show new password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.next ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Repeat new password"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({
                              ...p,
                              confirm: !p.confirm,
                            }))
                          }
                          aria-label={
                            showPasswords.confirm
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </form>
              </div>
            </div>

            {/* Provider Business Profile Summary (PROVIDER role only) */}
            {role === "PROVIDER" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-slate-900">
                      Business Service Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Public details clients see when browsing and booking your services.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/provider-setup")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                  >
                    <span>{provider ? "Update business info" : "Set up profile"}</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {!provider ? (
                  <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      Your provider profile is not configured yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Add your service name, description, location, and pricing so clients can book appointments.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/provider-setup")}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Set up business profile
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <div className="text-xs font-medium text-slate-500">Service Name</div>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          {provider.serviceName || "Not provided"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Description</div>
                        <p className="text-slate-600 leading-relaxed mt-0.5">
                          {provider.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-slate-500">Location</div>
                          <div className="text-slate-800 mt-0.5">
                            {[provider.address, provider.city, provider.state]
                              .filter(Boolean)
                              .join(", ") || "Not specified"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiDollarSign className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-slate-500">Pricing</div>
                          <div className="text-slate-800 mt-0.5 tabular-nums">
                            {provider.servicePricing
                              ? /^\d+(\.\d+)?$/.test(String(provider.servicePricing).trim())
                                ? `$${provider.servicePricing} per session`
                                : provider.servicePricing
                              : "Contact for pricing"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
