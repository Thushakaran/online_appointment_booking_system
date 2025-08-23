import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";

export default function AdminProviderManagement() {
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);

  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    serviceName: "",
    description: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/");
    }
  }, [token, role, navigate]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [providersRes, usersRes] = await Promise.all([
        api.get("/api/providers"),
        api.get("/api/users"),
      ]);
      setProviders(providersRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role === "ADMIN") {
      fetchData();
    }
  }, [token, role]);

  const handleAddProvider = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/providers", form);
      setMessage("Provider added successfully!");
      setForm({ userId: "", serviceName: "", description: "" });
      setShowAddForm(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add provider");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async (providerId) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      try {
        await api.delete(`/api/providers/${providerId}`);
        setMessage("Provider deleted successfully!");
        fetchData(); // Refresh data
      } catch (err) {
        setError("Failed to delete provider");
      }
    }
  };

  const handleUpdateProvider = async (providerId, updatedData) => {
    try {
      await api.put(`/api/providers/${providerId}`, updatedData);
      setMessage("Provider updated successfully!");
      fetchData(); // Refresh data
    } catch (err) {
      setError("Failed to update provider");
    }
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
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Provider Management</h1>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Back to Dashboard
          </button>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Add Provider Section */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">
              Add New Provider
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {showAddForm ? "Cancel" : "Add Provider"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select User
                </label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white"
                  required
                >
                  <option value="">Select a user...</option>
                  {users
                    .filter((user) => user.role === "USER")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={(e) =>
                    setForm({ ...form, serviceName: e.target.value })
                  }
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70"
                  placeholder="e.g., Medical Consultation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 w-full outline-none transition-all duration-300 text-white placeholder-white/70"
                  rows={3}
                  placeholder="Describe the service..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Provider"}
              </button>
            </form>
          )}
        </div>

        {/* Providers List */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            All Providers
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-3 text-white">Username</th>
                  <th className="text-left p-3 text-white">Email</th>
                  <th className="text-left p-3 text-white">Service Name</th>
                  <th className="text-left p-3 text-white">Description</th>
                  <th className="text-left p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-t border-white/20">
                    <td className="p-3 text-white">
                      {provider.user?.username}
                    </td>
                    <td className="p-3 text-white">{provider.user?.email}</td>
                    <td className="p-3 text-white">{provider.serviceName}</td>
                    <td className="p-3 text-white">{provider.description}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {providers.length === 0 && (
                  <tr>
                    <td className="p-3 text-white/60" colSpan="5">
                      No providers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
