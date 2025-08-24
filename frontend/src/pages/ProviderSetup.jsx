import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";

export default function ProviderSetup() {
  const navigate = useNavigate();
  const { token, role, userId } = useSelector((state) => state.auth);

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

  // Redirect if not logged in or not a provider
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (role !== "PROVIDER") {
      navigate("/");
    } else {
      // Check if provider profile already exists
      checkExistingProfile();
    }
  }, [token, role, navigate]);

  const checkExistingProfile = async () => {
    try {
      const response = await api.get("/api/providers/me");

      if (response.status === 200) {
        setExistingProvider(response.data);
        setIsNewProvider(false);
        setForm({
          serviceName: response.data.serviceName || "",
          description: response.data.description || "",
          profileImage: response.data.profileImage || "",
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || "",
          city: response.data.city || "",
          state: response.data.state || "",
          zipCode: response.data.zipCode || "",
          country: response.data.country || "",
          servicePricing: response.data.servicePricing || "",
        });
      }
    } catch (err) {
      // Provider profile doesn't exist yet (404) or other error, which is fine for new providers
      setIsNewProvider(true);
      // Ensure form is empty for new providers
      setForm({
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
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const providerData = {
        ...form,
      };

      if (existingProvider) {
        await api.put(`/api/providers/${existingProvider.id}`, providerData);
        setSuccess("Provider profile updated successfully!");
      } else {
        await api.post("/api/providers", providerData);
        setSuccess("Provider profile created successfully!");
      }

      setTimeout(() => {
        navigate("/provider-dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save provider profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
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
    const completedFields = requiredFields.filter((field) =>
      form[field]?.trim()
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!token || role !== "PROVIDER") {
    return <div className="p-4">Loading...</div>;
  }

  if (isLoadingProfile) {
    return (
      <VideoBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading provider profile...</span>
            </div>
          </div>
        </div>
      </VideoBackground>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <VideoBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Blue Banner Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white">
              <h1 className="text-3xl font-bold text-center mb-3 text-heading-h1">
                {isNewProvider
                  ? "Complete Your Provider Profile"
                  : "Update Your Provider Profile"}
              </h1>
              <p className="text-center text-blue-100 mb-6">
                {isNewProvider
                  ? "Set up your professional profile to start accepting appointments."
                  : "Update your professional profile to continue accepting appointments."}
              </p>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-100">Profile Completion</span>
                  <span className="text-blue-100">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-blue-500 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-white to-blue-100 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Welcome Message for New Providers */}
            {isNewProvider && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-8 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Welcome!</strong> Please complete your provider
                      profile to start accepting appointments. This information
                      will help clients find and book your services.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="flex justify-center space-x-12">
                {/* Step 1: Basic Info */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      currentStep === 1
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span
                    className={`font-medium ${
                      currentStep === 1 ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Basic Info
                  </span>
                </div>

                {/* Step 2: Location & Pricing */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      currentStep === 2
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
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
                  </div>
                  <span
                    className={`font-medium ${
                      currentStep === 2 ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Location & Pricing
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                  {success}
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-heading-h2">
                    Basic Information
                  </h2>

                  {/* Profile Photo */}
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-blue-200">
                      {form.profileImage ? (
                        <img
                          src={form.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-12 h-12 text-blue-400"
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
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {form.profileImage
                            ? "File selected"
                            : "No file chosen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="e.g., Medical Consultation, Legal Advice, Beauty Services"
                        value={form.serviceName}
                        onChange={(e) =>
                          setForm({ ...form, serviceName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="+1 (555) 123-4567"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm({ ...form, phoneNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="Describe your services, qualifications, experience, and what makes you unique..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Location & Pricing */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-heading-h2">
                    Location & Pricing
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="123 Main Street"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="New York"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="NY"
                        value={form.state}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="10001"
                        value={form.zipCode}
                        onChange={(e) =>
                          setForm({ ...form, zipCode: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="United States"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Pricing
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="Describe your pricing structure, consultation fees, packages..."
                      value={form.servicePricing}
                      onChange={(e) =>
                        setForm({ ...form, servicePricing: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {loading
                        ? "Saving..."
                        : existingProvider
                        ? "Update Profile"
                        : "Create Profile"}
                    </button>
                  )}
                </div>
              </div>

              {/* Skip Button */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/provider-dashboard")}
                  className="text-sm text-gray-500 hover:text-gray-700 mr-6 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
