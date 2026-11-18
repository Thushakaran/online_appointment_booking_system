import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FiBriefcase,
  FiMapPin,
  FiUpload,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiX,
  FiInfo,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";

export default function ProviderSetup() {
  const navigate = useNavigate();
  const { token, role, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    serviceName: "",
    description: "",
    profileImage: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    servicePricing: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [existingProvider, setExistingProvider] = useState(null);
  const [isNewProvider, setIsNewProvider] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "PROVIDER") {
      navigate("/");
      return;
    }

    const populateForm = (data) => {
      setExistingProvider(data);
      setIsNewProvider(false);
      setForm({
        serviceName: data.serviceName || "",
        description: data.description || "",
        profileImage: data.profileImage || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        country: data.country || "",
        servicePricing: data.servicePricing || "",
      });
    };

    const checkExistingProfile = async () => {
      try {
        const response = await api.get("/api/providers/me");
        if (response.status === 200 && response.data) {
          populateForm(response.data);
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 403) {
          try {
            const allProvidersRes = await api.get("/api/providers");
            const currentUser = user || localStorage.getItem("username");
            const userProvider = (allProvidersRes.data || []).find(
              (p) => p.user && p.user.username === currentUser
            );
            if (userProvider) {
              populateForm(userProvider);
            } else {
              setIsNewProvider(true);
            }
          } catch {
            setIsNewProvider(true);
          }
        } else {
          setIsNewProvider(true);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkExistingProfile();
  }, [token, role, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const providerData = { ...form };
      if (existingProvider) {
        await api.put(`/api/providers/${existingProvider.id}`, providerData);
        setSuccess("Provider profile updated successfully.");
      } else {
        await api.post("/api/providers", providerData);
        setSuccess("Provider profile created successfully.");
      }

      setTimeout(() => {
        navigate("/provider-dashboard");
      }, 1200);
    } catch (err) {
      if (err?.response?.status === 403) {
        setError("You do not have permission to update this provider profile.");
      } else if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          err?.response?.data?.message || "Failed to save provider profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const calculateProfileCompletion = () => {
    const requiredFields = [
      "serviceName",
      "description",
      "phoneNumber",
      "address",
      "city",
      "state",
    ];
    const optionalFields = ["zipCode", "country", "servicePricing"];

    const completedRequired = requiredFields.filter((f) => form[f]?.trim());
    const completedOptional = optionalFields.filter((f) => form[f]?.trim());

    return Math.round(
      (completedRequired.length / requiredFields.length) * 70 +
        (completedOptional.length / optionalFields.length) * 30
    );
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <DashboardShell
      title={isNewProvider ? "Complete Provider Profile" : "Service & Pricing"}
      breadcrumb="Provider Workspace"
      actions={
        <Link
          to="/provider-dashboard"
          className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Back to Dashboard
        </Link>
      }
    >
      {isLoadingProfile ? (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-48 bg-slate-100 rounded" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Progress Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {isNewProvider
                    ? "Set up your public service listing"
                    : "Update your service listing"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isNewProvider
                    ? "Clients see this information when browsing specialists and booking slots."
                    : "Changes take effect immediately across the public directory."}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-xs font-medium text-slate-500">
                  Profile Completion
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-indigo-600">
                  {profileCompletion}%
                </p>
              </div>
            </div>

            <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            {isNewProvider && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2.5">
                <FiInfo className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                <span>
                  Complete the required service and location fields below before
                  publishing your availability calendar.
                </span>
              </div>
            )}
          </div>

          {/* Stepper & Form */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  currentStep === 1
                    ? "bg-white border-indigo-600 text-indigo-700"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-white/60"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 1
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  1
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">Basic Information</p>
                  <p className="text-xs text-slate-500 truncate">
                    Service title, photo, contact
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  currentStep === 2
                    ? "bg-white border-indigo-600 text-indigo-700"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-white/60"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 2
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  2
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    Location & Pricing
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Practice address & rates
                  </p>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-3">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <FiCheck className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-slate-100">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {form.profileImage ? (
                        <img
                          src={form.profileImage}
                          alt="Service preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiBriefcase className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900">
                        Cover / Profile Image
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors">
                          <FiUpload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {form.profileImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm({ ...form, profileImage: "" })
                            }
                            className="px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        <span className="text-xs text-slate-500">
                          PNG or JPG up to 5 MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="setup-service"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Service Name *
                      </label>
                      <input
                        id="setup-service"
                        type="text"
                        required
                        value={form.serviceName}
                        onChange={(e) =>
                          setForm({ ...form, serviceName: e.target.value })
                        }
                        placeholder="e.g., Primary Care Consultation"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="setup-phone"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="setup-phone"
                        type="tel"
                        required
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm({ ...form, phoneNumber: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="setup-description"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Service Description *
                    </label>
                    <textarea
                      id="setup-description"
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Describe your qualifications, session format, and specialties..."
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FiMapPin className="w-4 h-4 text-indigo-600" />
                    <span>Practice / Office Location</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="setup-address"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Street Address *
                      </label>
                      <input
                        id="setup-address"
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        placeholder="450 Sutter Street, Suite 1200"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="setup-city"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        City *
                      </label>
                      <input
                        id="setup-city"
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        placeholder="San Francisco"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="setup-state"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        State / Province *
                      </label>
                      <input
                        id="setup-state"
                        type="text"
                        required
                        value={form.state}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                        placeholder="CA"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="setup-zip"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        ZIP / Postal Code
                      </label>
                      <input
                        id="setup-zip"
                        type="text"
                        value={form.zipCode}
                        onChange={(e) =>
                          setForm({ ...form, zipCode: e.target.value })
                        }
                        placeholder="94108"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="setup-country"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Country
                      </label>
                      <input
                        id="setup-country"
                        type="text"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                        placeholder="United States"
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="setup-pricing"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Service Pricing
                    </label>
                    <input
                      id="setup-pricing"
                      type="text"
                      value={form.servicePricing}
                      onChange={(e) =>
                        setForm({ ...form, servicePricing: e.target.value })
                      }
                      placeholder="e.g., 145 / 45-min consultation"
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <span>Continue</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>
                      {loading
                        ? "Saving..."
                        : existingProvider
                        ? "Save Changes"
                        : "Create Provider Profile"}
                    </span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
