import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiBriefcase,
} from "react-icons/fi";

export default function AdminProviderManagement() {
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);

  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    userId: "",
    serviceName: "",
    description: "",
  });

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const fetchData = useCallback(async () => {
    if (!token || role !== "ADMIN") return;
    try {
      setLoading(true);
      const [providersRes, usersRes] = await Promise.all([
        api.get("/api/providers"),
        api.get("/api/users"),
      ]);
      setProviders(providersRes.data || []);
      setUsers(usersRes.data || []);
    } catch {
      setError("Failed to fetch provider and user records.");
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProvider = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      await api.post("/api/providers", form);
      setMessage("Provider role assigned and profile created.");
      setForm({ userId: "", serviceName: "", description: "" });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add provider.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProvider = async (provider) => {
    if (
      !window.confirm(
        `Delete provider "${provider.serviceName || provider.user?.username}"?`
      )
    ) {
      return;
    }
    try {
      setError("");
      await api.delete(`/api/providers/${provider.id}`);
      setMessage("Provider deleted successfully.");
      fetchData();
    } catch {
      setError("Failed to delete provider.");
    }
  };

  const eligibleUsers = useMemo(
    () => users.filter((u) => u.role === "USER"),
    [users]
  );

  const filteredProviders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        (p.serviceName || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.user?.username || "").toLowerCase().includes(q) ||
        (p.user?.email || "").toLowerCase().includes(q)
    );
  }, [providers, searchQuery]);

  return (
    <AppShell
      title="Provider Onboarding"
      breadcrumb="Provider Management"
      primaryAction={{
        label: showAddForm ? "Close Form" : "Assign Provider",
        Icon: showAddForm ? FiX : FiPlus,
        onClick: () => setShowAddForm((prev) => !prev),
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              Provider Onboarding & Directory
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Assign provider profiles to registered accounts or manage active listings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Admin Console</span>
          </button>
        </div>

        <FeedbackBanner
          variant="error"
          message={error}
          onDismiss={() => setError("")}
        />
        <FeedbackBanner
          variant="success"
          message={message}
          onDismiss={() => setMessage("")}
        />

        {/* Add Provider Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-semibold text-slate-900">
                Assign Provider Role & Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {eligibleUsers.length} standard user account
                {eligibleUsers.length === 1 ? "" : "s"} available to promote.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              {showAddForm ? (
                <>
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  <span>Add provider</span>
                </>
              )}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddProvider}
              className="mt-6 pt-6 border-t border-slate-200 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="provider-user-select"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Select User Account *
                  </label>
                  <select
                    id="provider-user-select"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choose a user account...</option>
                    {eligibleUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="provider-service-input"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Service Name *
                  </label>
                  <input
                    id="provider-service-input"
                    type="text"
                    value={form.serviceName}
                    onChange={(e) =>
                      setForm({ ...form, serviceName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Medical Consultation"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="provider-desc-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="provider-desc-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Describe the services provided..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || eligibleUsers.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>{submitting ? "Creating..." : "Create Provider"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* All Providers Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-semibold text-slate-900">
                All Providers
              </h2>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {providers.length}
              </span>
            </div>

            <div className="relative">
              <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search providers..."
                className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                    <th className="py-3 pr-4">Account</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProviders.map((provider) => (
                    <tr
                      key={provider.id}
                      className="hover:bg-slate-50/75 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-slate-900">
                          {provider.user?.username || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {provider.user?.email || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {provider.serviceName || "Unnamed Service"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md">
                        <p className="line-clamp-2">
                          {provider.description || "No description"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status="PROVIDER" />
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteProvider(provider)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProviders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <FiBriefcase className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          No matching providers found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
