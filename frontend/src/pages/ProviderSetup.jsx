import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiBriefcase,
  FiMapPin,
  FiUpload,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";

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

  const applyProviderToForm = (data) => ({
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

  const checkExistingProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/providers/me");
      if (response.status === 200 && response.data) {
        setExistingProvider(response.data);
        setIsNewProvider(false);
        setForm(applyProviderToForm(response.data));
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
            setExistingProvider(userProvider);
            setIsNewProvider(false);
            setForm(applyProviderToForm(userProvider));
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
  }, [user]);

  useEffect(() => {
    if (!token || role !== "PROVIDER") {
      navigate("/login");
      return;
    }
    checkExistingProfile();
  }, [token, role, navigate, checkExistingProfile]);

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
      }, 1500);
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(
          "You do not have permission to update this provider profile."
        );
      } else if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
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

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image file size must be less than 5MB.");
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

    const requiredCompletion =
      (completedRequired.length / requiredFields.length) * 70;
    const optionalCompletion =
      (completedOptional.length / optionalFields.length) * 30;

    return Math.round(requiredCompletion + optionalCompletion);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <AppShell title="Business Profile Setup" breadcrumb="Business Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {isLoadingProfile ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Loading provider profile...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header & Progress */}
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900">
                    {isNewProvider
                      ? "Set Up Your Business Profile"
                      : "Update Business Profile"}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {isNewProvider
                      ? "Add your service details, location, and pricing to start accepting bookings."
                      : "Keep your public service details and pricing up to date for clients."}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-xs font-medium text-slate-500">
                    Profile completion
                  </div>
                  <div className="text-lg font-display font-bold text-indigo-600 tabular-nums">
                    {profileCompletion}%
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              {/* Step Switcher */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    currentStep === 1
                      ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                      currentStep === 1
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    1
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      Service & Profile
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Name, contact & bio
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    currentStep === 2
                      ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                      currentStep === 2
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    2
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      Location & Pricing
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Address & session rate
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {isNewProvider && (
                <FeedbackBanner
                  variant="info"
                  message="Welcome! Complete both steps below so clients can discover your practice in the provider directory."
                />
              )}

              <FeedbackBanner
                variant="error"
                message={error}
                onDismiss={() => setError("")}
              />
              <FeedbackBanner
                variant="success"
                message={success}
                onDismiss={() => setSuccess("")}
              />

              {currentStep === 1 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-900 font-display font-semibold">
                    <FiBriefcase className="w-4 h-4 text-indigo-600" />
                    <h2>Basic Information</h2>
                  </div>

                  {/* Profile Image Upload */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {form.profileImage ? (
                        <img
                          src={form.profileImage}
                          alt="Provider profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiBriefcase className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        Profile Image
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        PNG, JPG, or WEBP up to 5MB.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <FiUpload className="w-3.5 h-3.5" />
                          <span>Upload photo</span>
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
                              setForm((prev) => ({ ...prev, profileImage: "" }))
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="service-name"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Service Name *
                      </label>
                      <input
                        id="service-name"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., General Medical Consultation"
                        value={form.serviceName}
                        onChange={(e) =>
                          setForm({ ...form, serviceName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone-number"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="phone-number"
                        type="tel"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1 (555) 123-4567"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm({ ...form, phoneNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="service-description"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Service Description *
                    </label>
                    <textarea
                      id="service-description"
                      required
                      rows={4}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe your specialties, qualifications, and what clients can expect..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-900 font-display font-semibold">
                    <FiMapPin className="w-4 h-4 text-indigo-600" />
                    <h2>Location & Pricing</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="provider-address"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Street Address *
                      </label>
                      <input
                        id="provider-address"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="123 Main Street"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="provider-city"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        City *
                      </label>
                      <input
                        id="provider-city"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="New York"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="provider-state"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        State / Province *
                      </label>
                      <input
                        id="provider-state"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="NY"
                        value={form.state}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="provider-zip"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        ZIP / Postal Code
                      </label>
                      <input
                        id="provider-zip"
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="10001"
                        value={form.zipCode}
                        onChange={(e) =>
                          setForm({ ...form, zipCode: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="provider-country"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Country
                      </label>
                      <input
                        id="provider-country"
                        type="text"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="United States"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="provider-pricing"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Service Pricing
                    </label>
                    <input
                      id="provider-pricing"
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 120 or $120 per consultation"
                      value={form.servicePricing}
                      onChange={(e) =>
                        setForm({ ...form, servicePricing: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/provider-dashboard")}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Back to dashboard
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  )}

                  {currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <span>Next step</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>
                        {loading
                          ? "Saving..."
                          : existingProvider
                          ? "Save changes"
                          : "Create provider profile"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
