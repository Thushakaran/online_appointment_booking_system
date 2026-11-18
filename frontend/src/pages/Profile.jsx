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
  FiCamera,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiHash,
} from "react-icons/fi";
import api from "../api/axios";
import { logout, updateUser } from "../features/auth/authSlice";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/ui/StatusBadge";
import AlertBanner from "../components/ui/AlertBanner";
import { useToast } from "../components/ui/toastContext";

export default function Profile() {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

  const [me, setMe] = useState(null);
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [profileImageDraft, setProfileImageDraft] = useState(null);
  const [savingImage, setSavingImage] = useState(false);

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
        let resolvedImage = userRes.data.profileImage || "";

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
            if (!resolvedImage && providerRes.data?.profileImage) {
              resolvedImage = providerRes.data.profileImage;
            }
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

        dispatch(
          updateUser({
            username: userRes.data.username,
            role: userRes.data.role || role,
            profileImage: resolvedImage,
          })
        );
      } catch {
        setErr("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, navigate, dispatch]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!me) return;
    setErr("");
    setSavingProfile(true);
    try {
      const updatedUser = await api.put(`/api/users/${me.id}`, editForm);
      setMe(updatedUser.data);

      if (editForm.username !== me.username) {
        toast.info(
          "Username updated. Signing you out so your session token refreshes..."
        );
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 1800);
        return;
      }

      setIsEditing(false);
      dispatch(
        updateUser({
          username: updatedUser.data.username,
          profileImage: updatedUser.data.profileImage || "",
        })
      );
      toast.success("Account details updated successfully.");
    } catch (error) {
      let message = "Failed to update profile.";
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          message = data.error || "Invalid profile information provided.";
        } else if (status === 401) {
          message = "Authentication failed. Please log in again.";
        } else if (status === 403) {
          message = "You do not have permission to update this profile.";
        } else if (status === 409) {
          message = "That username or email is already taken.";
        } else {
          message = data.error || "Failed to update profile.";
        }
      } else {
        message = "Network error. Please verify your connection.";
      }
      setErr(message);
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("Profile images must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageDraft(String(reader.result));
      setErr("");
    };
    reader.onerror = () => setErr("Could not read this image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const saveProfileImage = async () => {
    if (!me || profileImageDraft === null) return;
    setSavingImage(true);
    setErr("");
    try {
      const response = await api.put(`/api/users/${me.id}`, {
        profileImage: profileImageDraft,
      });
      setMe(response.data);
      const nextImage = response.data.profileImage || "";
      dispatch(
        updateUser({
          profileImage:
            nextImage || (role === "PROVIDER" ? provider?.profileImage || "" : ""),
        })
      );
      setProfileImageDraft(null);
      toast.success(
        profileImageDraft ? "Profile photo updated." : "Profile photo removed."
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not save your profile photo.";
      setErr(message);
      toast.error(message);
    } finally {
      setSavingImage(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErr("");

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
      toast.success("Password changed successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to change password. Check your current password.";
      setErr(message);
      toast.error(message);
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
          id: `appointment-${a.id}-${a.status}`,
          title:
            role === "PROVIDER"
              ? `Booking from ${a.user?.username || "Client"} (${a.status})`
              : `${a.provider?.serviceName || "Appointment"} (${a.status})`,
          detail: dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A"),
        })),
    [appointments, role]
  );

  const profileImage = profileImageDraft !== null
    ? profileImageDraft
    : me?.profileImage || (role === "PROVIDER" ? provider?.profileImage : "");

  const content = (
    <div className="space-y-6">
        <AlertBanner
          variant="error"
          message={err}
          onDismiss={() => setErr("")}
        />

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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-slate-200 ring-1 ring-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={`${me.username}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-2xl font-bold text-indigo-600">
                          {(me.username || "U").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label
                      title={me.profileImage ? "Change photo" : "Upload photo"}
                      className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <FiCamera className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="sr-only">
                        {me.profileImage ? "Change profile photo" : "Upload profile photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageSelect}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 truncate">
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

                    <div className="flex flex-wrap items-center gap-2">
                      {profileImageDraft !== null ? (
                        <>
                          <button
                            type="button"
                            onClick={saveProfileImage}
                            disabled={savingImage}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>
                              {savingImage
                                ? "Saving..."
                                : profileImageDraft
                                ? "Save photo"
                                : "Confirm removal"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileImageDraft(null)}
                            disabled={savingImage}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <FiX className="w-3.5 h-3.5" />
                            <span>Discard</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                            <FiCamera className="w-3.5 h-3.5 text-slate-500" />
                            <span>{me.profileImage ? "Change photo" : "Upload photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageSelect}
                              className="sr-only"
                            />
                          </label>
                          {me.profileImage && (
                            <button
                              type="button"
                              onClick={() => setProfileImageDraft("")}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing((prev) => !prev);
                    setEditForm({ username: me.username, email: me.email });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-center"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>{isEditing ? "Cancel Editing" : "Edit Account"}</span>
                </button>
              </div>
            </div>

            {/* Activity KPI Strip */}
            {role === "PROVIDER" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Slots</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                      {availabilities.length}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <FiCalendar className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Open Slots</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                      {stats.openSlots}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FiClock className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Bookings</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                      {stats.total}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Profile Status</p>
                    <div className="mt-2.5">
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
                  <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <FiShield className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Total Bookings
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                      {stats.total}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FiCalendar className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Pending</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600 font-mono tabular-nums">
                      {stats.pending}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FiClock className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Completed</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                      {stats.completed}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Cancelled</p>
                    <p className="mt-2 text-2xl font-bold text-rose-600 font-mono tabular-nums">
                      {stats.cancelled}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FiXCircle className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
              {/* Left Column: Account Details + Provider Service Card */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div
                  className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between ${
                    role !== "PROVIDER" ? "flex-1" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Account Details
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Your verified account identity and contact details.
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setEditForm({ username: me.username, email: me.email });
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 shrink-0"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

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
                        <div className="py-3.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 inline-flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-slate-400" />
                            <span>Username</span>
                          </dt>
                          <dd className="font-medium text-slate-900">{me.username}</dd>
                        </div>
                        <div className="py-3.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 inline-flex items-center gap-2">
                            <FiMail className="w-4 h-4 text-slate-400" />
                            <span>Email Address</span>
                          </dt>
                          <dd className="font-medium text-slate-900 truncate">{me.email}</dd>
                        </div>
                        <div className="py-3.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 inline-flex items-center gap-2">
                            <FiShield className="w-4 h-4 text-slate-400" />
                            <span>Account Role</span>
                          </dt>
                          <dd>
                            <StatusBadge status={role} />
                          </dd>
                        </div>
                        <div className="py-3.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 inline-flex items-center gap-2">
                            <FiHash className="w-4 h-4 text-slate-400" />
                            <span>Account ID</span>
                          </dt>
                          <dd className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            #{me.id}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="pt-4 mt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Signed in as <span className="font-medium text-slate-700">@{me.username}</span>
                      </span>
                      <Link
                        to={
                          role === "PROVIDER"
                            ? "/provider-setup"
                            : role === "ADMIN"
                            ? "/admin-dashboard"
                            : "/appointments"
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <span>
                          {role === "PROVIDER"
                            ? "Manage Provider Profile"
                            : role === "ADMIN"
                            ? "Open Admin Console"
                            : "View Booking History"}
                        </span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {role === "PROVIDER" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
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
              <div className="lg:col-span-6 flex">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full">
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
  );

  if (role === "PROVIDER" || role === "ADMIN") {
    return (
      <DashboardShell
        title="Account Profile"
        breadcrumb={role === "ADMIN" ? "Admin Console" : "Provider Workspace"}
        breadcrumbTo={role === "ADMIN" ? "/admin-dashboard" : "/provider-dashboard"}
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
          ) : (
            <Link
              to="/admin-dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <FiArrowRight className="w-4 h-4" />
              <span>Admin Overview</span>
            </Link>
          )
        }
      >
        {content}
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Account Profile
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your personal details, booking summary, and account password.
          </p>
        </div>
        {content}
      </div>
    </div>
  );
}
