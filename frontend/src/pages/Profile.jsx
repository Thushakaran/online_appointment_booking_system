import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit2,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiBriefcase,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

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
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
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
            const appointmentsRes = await api.get(
              "/api/appointments/my-appointments"
            );
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
            try {
              const availRes = await api.get(
                "/api/availabilities/my-availabilities"
              );
              setAvailabilities(availRes.data || []);
            } catch {
              setAvailabilities([]);
            }
          } catch {
            setProvider(null);
          }
        }
      } catch {
        setErr("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!me) return;
    setErr("");
    setSuccess("");
    setSavingProfile(true);
    try {
      const updatedUser = await api.put(`/api/users/${me.id}`, editForm);
      setMe(updatedUser.data);

      if (editForm.username !== me.username) {
        setSuccess(
          "Username updated. Signing you out so you can log in with your new username..."
        );
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 1800);
        return;
      }

      setIsEditing(false);
      setSuccess("Account details updated successfully.");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          setErr(data.error || "Invalid profile information provided.");
        } else if (status === 401) {
          setErr("Authentication failed. Please log in again.");
        } else if (status === 403) {
          setErr("You do not have permission to update this profile.");
        } else if (status === 409) {
          setErr("That username or email is already taken.");
        } else {
          setErr(data.error || "Failed to update profile.");
        }
      } else {
        setErr("Network error. Please verify your connection.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setErr("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErr("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await api.post("/api/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully.");
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to change password. Check your current password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const cancelled = appointments.filter((a) => a.status === "CANCELLED").length;
    const openSlots = availabilities.filter((a) => !a.isBooked).length;
    return { total, confirmed, completed, pending, cancelled, openSlots };
  }, [appointments, availabilities]);

  const notifications = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
        .slice(0, 5)
        .map((a) => ({
          id: `prof-${a.id}`,
          title:
            role === "PROVIDER"
              ? `Booking from ${a.user?.username || "Client"} (${a.status})`
              : `${a.provider?.serviceName || "Appointment"} (${a.status})`,
          detail: dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A"),
        })),
    [appointments, role]
  );

  return (
    <DashboardShell
      title="Account Profile"
      breadcrumb={role === "PROVIDER" ? "Provider Workspace" : "Client Workspace"}
      notifications={notifications}
      actions={
        role === "PROVIDER" ? (
          <Link
            to="/provider-setup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>{provider ? "Edit Service Profile" : "Complete Service Setup"}</span>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {err && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{err}</span>
            <button
              type="button"
              onClick={() => setErr("")}
              className="text-rose-500 hover:text-rose-700 p-1"
              aria-label="Dismiss error"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-emerald-600 hover:text-emerald-800 p-1"
              aria-label="Dismiss notice"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : !me ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
            No account data available.
          </div>
        ) : (
          <>
            {/* Profile Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                  {role === "PROVIDER" && provider?.profileImage ? (
                    <img
                      src={provider.profileImage}
                      alt={provider.serviceName || me.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl font-bold text-indigo-600">
                      {(me.username || "U").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-xl font-bold text-slate-900 truncate">
                      {role === "PROVIDER" && provider?.serviceName
                        ? provider.serviceName
                        : me.username}
                    </h2>
                    <StatusBadge status={role} />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">
                    @{me.username} · {me.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setEditForm({ username: me.username, email: me.email });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-center"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>{isEditing ? "Cancel Editing" : "Edit Account"}</span>
              </button>
            </div>

            {/* Activity KPI Strip */}
            {role === "PROVIDER" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Total Slots</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {availabilities.length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Open Slots</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                    {stats.openSlots}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Total Bookings</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Profile Status</p>
                  <div className="mt-2">
                    <StatusBadge
                      status={
                        provider
                          ? availabilities.length > 0
                            ? "ACTIVE"
                            : "SETUP"
                          : "SETUP"
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">
                    Total Bookings
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600 font-mono tabular-nums">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Completed</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                    {stats.completed}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Cancelled</p>
                  <p className="mt-2 text-2xl font-bold text-rose-600 font-mono tabular-nums">
                    {stats.cancelled}
                  </p>
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Account Details + Provider Service Card */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Account Details
                  </h3>

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      {editForm.username !== me.username && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2">
                          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Changing your username will sign you out so your session
                            token refreshes.
                          </span>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="profile-username"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Username
                        </label>
                        <div className="relative">
                          <FiUser className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="profile-username"
                            type="text"
                            required
                            value={editForm.username}
                            onChange={(e) =>
                              setEditForm({ ...editForm, username: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="profile-email"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <FiMail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="profile-email"
                            type="email"
                            required
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({ ...editForm, email: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          <FiCheck className="w-4 h-4" />
                          <span>
                            {savingProfile ? "Saving..." : "Save Changes"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="divide-y divide-slate-100 text-sm">
                      <div className="py-3 flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Username</dt>
                        <dd className="font-medium text-slate-900">{me.username}</dd>
                      </div>
                      <div className="py-3 flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Email</dt>
                        <dd className="font-medium text-slate-900">{me.email}</dd>
                      </div>
                      <div className="py-3 flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Account Role</dt>
                        <dd>
                          <StatusBadge status={role} />
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>

                {role === "PROVIDER" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">
                        Service Information
                      </h3>
                      <Link
                        to="/provider-setup"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {provider ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Service Name</p>
                          <p className="font-medium text-slate-900 mt-0.5">
                            {provider.serviceName}
                          </p>
                        </div>
                        {provider.description && (
                          <div>
                            <p className="text-xs text-slate-500">Description</p>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">
                              {provider.description}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500">Location</p>
                            <p className="font-medium text-slate-900 mt-0.5">
                              {[provider.city, provider.state]
                                .filter(Boolean)
                                .join(", ") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pricing</p>
                            <p className="font-medium font-mono tabular-nums text-slate-900 mt-0.5">
                              {provider.servicePricing
                                ? `$${provider.servicePricing}`
                                : "Standard rate"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FiBriefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-900">
                          Service profile not completed
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Add your service details, pricing, and location to appear in
                          the public directory.
                        </p>
                        <Link
                          to="/provider-setup"
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                        >
                          Complete Setup
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Password & Security */}
              <div className="lg:col-span-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Password & Security
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Update your account password to keep your bookings secure.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => !prev)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPasswords ? "Hide passwords" : "Show passwords"
                      }
                    >
                      {showPasswords ? (
                        <FiEyeOff className="w-4 h-4" />
                      ) : (
                        <FiEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <FiLock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="current-password"
                          type={showPasswords ? "text" : "password"}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <FiLock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="new-password"
                          type={showPasswords ? "text" : "password"}
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="At least 6 characters"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <FiLock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="confirm-password"
                          type={showPasswords ? "text" : "password"}
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Repeat new password"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      {savingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
