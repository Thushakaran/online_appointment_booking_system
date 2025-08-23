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
    businessHours: "",
    specializations: "",
    education: "",
    certifications: "",
    experience: "",
    website: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    servicePricing: "",
    acceptedInsurance: "",
    languages: "",
    profileCompleted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [existingProvider, setExistingProvider] = useState(null);

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
      setExistingProvider(response.data);
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
        businessHours: response.data.businessHours || "",
        specializations: response.data.specializations || "",
        education: response.data.education || "",
        certifications: response.data.certifications || "",
        experience: response.data.experience || "",
        website: response.data.website || "",
        linkedin: response.data.linkedin || "",
        twitter: response.data.twitter || "",
        facebook: response.data.facebook || "",
        servicePricing: response.data.servicePricing || "",
        acceptedInsurance: response.data.acceptedInsurance || "",
        languages: response.data.languages || "",
        profileCompleted: response.data.profileCompleted || false,
      });
    } catch (err) {
      // Provider profile doesn't exist yet, which is fine
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
        profileCompleted: true,
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
      "businessHours",
    ];
    const completedFields = requiredFields.filter((field) =>
      form[field]?.trim()
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!token || role !== "PROVIDER") {
    return <div className="p-4">Loading...</div>;
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <VideoBackground>
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
              <h1 className="text-3xl font-bold text-center">
                {existingProvider
                  ? "Update Your Provider Profile"
                  : "Complete Your Provider Profile"}
              </h1>
              <p className="text-center mt-2 text-blue-100">
                Set up your professional profile to start accepting appointments
              </p>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-center space-x-8">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === step
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">
                      {step}
                    </span>
                    <span className="hidden sm:inline">
                      {step === 1 && "Basic Info"}
                      {step === 2 && "Contact & Location"}
                      {step === 3 && "Professional Details"}
                      {step === 4 && "Social & Pricing"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
                  {success}
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Basic Information
                  </h2>

                  {/* Profile Image */}
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {form.profileImage ? (
                        <img
                          src={form.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-12 h-12 text-gray-400"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Medical Consultation, Legal Advice"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your services, qualifications, and what makes you unique..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Contact & Location
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="United States"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Hours *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mon-Fri 9AM-5PM, Sat 10AM-2PM"
                        value={form.businessHours}
                        onChange={(e) =>
                          setForm({ ...form, businessHours: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Professional Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Professional Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Cardiology, Pediatrics, Family Medicine"
                        value={form.specializations}
                        onChange={(e) =>
                          setForm({ ...form, specializations: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 15+ years"
                        value={form.experience}
                        onChange={(e) =>
                          setForm({ ...form, experience: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="List your educational background, degrees, institutions..."
                      value={form.education}
                      onChange={(e) =>
                        setForm({ ...form, education: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications & Licenses
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="List your professional certifications, licenses, and credentials..."
                      value={form.certifications}
                      onChange={(e) =>
                        setForm({ ...form, certifications: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., English, Spanish, French"
                      value={form.languages}
                      onChange={(e) =>
                        setForm({ ...form, languages: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Social & Pricing */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Social Media & Pricing
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                        value={form.website}
                        onChange={(e) =>
                          setForm({ ...form, website: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={form.linkedin}
                        onChange={(e) =>
                          setForm({ ...form, linkedin: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://twitter.com/yourhandle"
                        value={form.twitter}
                        onChange={(e) =>
                          setForm({ ...form, twitter: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://facebook.com/yourpage"
                        value={form.facebook}
                        onChange={(e) =>
                          setForm({ ...form, facebook: e.target.value })
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your pricing structure, consultation fees, packages..."
                      value={form.servicePricing}
                      onChange={(e) =>
                        setForm({ ...form, servicePricing: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accepted Insurance
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Blue Cross, Aetna, Medicare, Self-pay"
                      value={form.acceptedInsurance}
                      onChange={(e) =>
                        setForm({ ...form, acceptedInsurance: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/provider-dashboard")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
