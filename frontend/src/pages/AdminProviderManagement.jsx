import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiBriefcase,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import ConfirmModal from "../components/ui/ConfirmModal";

const EMPTY_FORM = {
  userId: "",
  serviceName: "",
  description: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  servicePricing: "",
};

export default function AdminProviderManagement() {
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);

  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setError("");
    } catch (requestError) {
      const status = requestError?.response?.status;
      const detail =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error;
      setError(
        [
          "Failed to fetch provider directory.",
          status ? `HTTP ${status}.` : "",
          detail || "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const handleAddProvider = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await api.post("/api/providers", form);
      setMessage("Provider onboarded successfully.");
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(
          "Your backend restricts provider creation to Provider-role accounts. Have the provider register and complete Service Setup from their portal."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to add provider."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (provider) => {
    setEditTarget(provider);
    setEditForm({
      userId: provider.user?.id || "",
      serviceName: provider.serviceName || "",
      description: provider.description || "",
      phoneNumber: provider.phoneNumber || "",
      address: provider.address || "",
      city: provider.city || "",
      state: provider.state || "",
      zipCode: provider.zipCode || "",
      country: provider.country || "",
      servicePricing: provider.servicePricing || "",
      profileImage: provider.profileImage || "",
    });
  };

  const handleUpdateProvider = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setSubmitting(true);
      setError("");
      await api.put(`/api/providers/${editTarget.id}`, editForm);
      setMessage(`Updated "${editForm.serviceName}".`);
      setEditTarget(null);
      await fetchData();
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(
          "Your backend restricts editing provider listings to the owning Provider account."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to update provider details."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteProvider = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/api/providers/${deleteTarget.id}`);
      setMessage(`Provider "${deleteTarget.serviceName}" removed.`);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete provider."
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
        (p.user?.username || "").toLowerCase().includes(q) ||
        (p.user?.email || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.state || "").toLowerCase().includes(q)
    );
  }, [providers, searchQuery]);

  return (
    <DashboardShell
      title="Provider Directory"
      breadcrumb="Admin Console"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin-dashboard"
            className="saas-btn-secondary px-3.5 py-2 text-sm whitespace-nowrap"
          >
            Back to Overview
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="saas-btn-primary px-4 py-2 text-sm whitespace-nowrap"
          >
            <FiPlus className="w-4 h-4" />
            <span>{showAddForm ? "Close Form" : "Add Provider"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <span>{error}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchData}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-medium"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-4">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss notice"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Provider Panel */}
        {showAddForm && (
          <div className="saas-card p-6 animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-slate-900">
                  Onboard New Service Provider
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Promote an existing client account to a listed service provider.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close form"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {eligibleUsers.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                No eligible client accounts are available to promote. Register a
                new account first.
              </div>
            ) : (
              <form onSubmit={handleAddProvider} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="add-prov-user"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      User Account *
                    </label>
                    <select
                      id="add-prov-user"
                      required
                      value={form.userId}
                      onChange={(e) =>
                        setForm({ ...form, userId: e.target.value })
                      }
                      className="saas-input px-3.5 py-2 text-sm"
                    >
                      <option value="">Select user account...</option>
                      {eligibleUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="add-prov-service"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Service Name *
                    </label>
                    <input
                      id="add-prov-service"
                      type="text"
                      required
                      value={form.serviceName}
                      onChange={(e) =>
                        setForm({ ...form, serviceName: e.target.value })
                      }
                      placeholder="e.g., Medical Consultation"
                      className="saas-input px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-prov-phone"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      id="add-prov-phone"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                      className="saas-input px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-prov-pricing"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Pricing
                    </label>
                    <input
                      id="add-prov-pricing"
                      type="text"
                      value={form.servicePricing}
                      onChange={(e) =>
                        setForm({ ...form, servicePricing: e.target.value })
                      }
                      placeholder="150 / 45-min session"
                      className="saas-input px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-prov-address"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Street Address
                    </label>
                    <input
                      id="add-prov-address"
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="123 Main Street"
                      className="saas-input px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="add-prov-city"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        City
                      </label>
                      <input
                        id="add-prov-city"
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        placeholder="San Francisco"
                        className="saas-input px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-prov-state"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        State
                      </label>
                      <input
                        id="add-prov-state"
                        type="text"
                        value={form.state}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                        placeholder="CA"
                        className="saas-input px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="add-prov-desc"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    id="add-prov-desc"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe the service..."
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="saas-btn-primary px-4 py-2 text-sm"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>{submitting ? "Adding..." : "Create Provider"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="saas-btn-secondary px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Directory Table */}
        <div className="saas-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-bold text-slate-900">
                All Providers ({filteredProviders.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit service details or remove listings from the platform.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service, username, city..."
                className="saas-input pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
                <FiBriefcase className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                No providers found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search or onboard a new provider above.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="saas-btn-secondary mt-4 px-3.5 py-1.5 text-xs"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Account</th>
                    <th className="text-left py-3 px-4">Service Name</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Pricing</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 tabular-nums">
                        #{provider.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {provider.user?.username || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {provider.user?.email || "—"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {provider.serviceName}
                        </p>
                        {provider.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {provider.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {[provider.city, provider.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs tabular-nums whitespace-nowrap">
                        {provider.servicePricing
                          ? `$${provider.servicePricing}`
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(provider)}
                            className="saas-btn-secondary px-2.5 py-1.5 text-xs whitespace-nowrap"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(provider)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors whitespace-nowrap"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Provider Modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-provider-title"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-modal-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3
                id="edit-provider-title"
                className="font-display text-base font-bold text-slate-900"
              >
                Edit Provider ({editTarget.user?.username || "Service"})
              </h3>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.serviceName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, serviceName: e.target.value })
                  }
                  className="saas-input px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="saas-input px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) =>
                      setEditForm({ ...editForm, state: e.target.value })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={editForm.zipCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, zipCode: e.target.value })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) =>
                      setEditForm({ ...editForm, country: e.target.value })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pricing
                  </label>
                  <input
                    type="text"
                    value={editForm.servicePricing}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        servicePricing: e.target.value,
                      })
                    }
                    className="saas-input px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="saas-input px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="saas-btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="saas-btn-primary px-4 py-2 text-sm"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete service provider?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.serviceName}" from the directory? Associated availability slots and bookings will be removed.`
            : ""
        }
        confirmLabel="Delete Provider"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteProvider}
      />
    </DashboardShell>
  );
}
