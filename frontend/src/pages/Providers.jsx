import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import Pagination from "../components/Pagination";
import FeedbackBanner from "../components/FeedbackBanner";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiArrowRight,
  FiX,
} from "react-icons/fi";

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [err, setErr] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("general");

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm.trim()) {
        switch (searchType) {
          case "service":
            response = await api.get(
              `/api/providers/search/service/paginated?serviceName=${encodeURIComponent(
                searchTerm
              )}&page=${currentPage}&size=6`
            );
            break;
          case "city":
            response = await api.get(
              `/api/providers/search/city/paginated?city=${encodeURIComponent(
                searchTerm
              )}&page=${currentPage}&size=6`
            );
            break;
          case "description":
            response = await api.get(
              `/api/providers/search/description/paginated?description=${encodeURIComponent(
                searchTerm
              )}&page=${currentPage}&size=6`
            );
            break;
          default:
            response = await api.get(
              `/api/providers/search/paginated?q=${encodeURIComponent(
                searchTerm
              )}&page=${currentPage}&size=6`
            );
        }
      } else {
        response = await api.get(
          `/api/providers/paginated?page=${currentPage}&size=6`
        );
      }

      const data = response.data || {};
      setProviders(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setHasNext(data.hasNext || false);
      setHasPrevious(data.hasPrevious || false);
      setErr("");
    } catch {
      setErr("Failed to load service providers. Please try again.");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, searchType]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleProviderClick = (provider) => {
    navigate(`/book-appointment/${provider.id}`, {
      state: { provider },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setSearchType("general");
    setCurrentPage(0);
  };

  return (
    <AppShell title="Service Providers" breadcrumb="Browse Providers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Service Providers
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse verified providers, inspect open slots, and book your appointment.
            </p>
          </div>
          {!loading && (
            <div className="text-sm text-slate-500 tabular-nums">
              {totalElements} {totalElements === 1 ? "provider" : "providers"} available
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <form
          onSubmit={handleSearch}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by service, provider, city, or keywords..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              aria-label="Filter field"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="general">All fields</option>
              <option value="service">Service name</option>
              <option value="city">City</option>
              <option value="description">Description</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
            >
              Search
            </button>

            {(searchTerm || searchInput) && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <FiX className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>

        <FeedbackBanner variant="error" message={err} onDismiss={() => setErr("")} />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FiSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-display font-semibold text-slate-900">
              No matching providers found
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-5 max-w-md mx-auto">
              {searchTerm
                ? `No service providers matched "${searchTerm}". Try adjusting your keywords or filter.`
                : "There are currently no active service providers listed."}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          /* Providers Grid */
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => {
                const openSlots = provider.availabilities?.length || 0;
                return (
                  <article
                    key={provider.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      {/* Image or clean fallback */}
                      <div className="h-44 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                        {provider.profileImage ? (
                          <img
                            src={provider.profileImage}
                            alt={provider.serviceName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <FiBriefcase className="w-8 h-8 mb-1.5" />
                            <span className="text-xs font-medium text-slate-500">
                              {provider.serviceName || "Service Provider"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-lg font-display font-semibold text-slate-900 leading-snug">
                            {provider.serviceName}
                          </h2>
                          {provider.servicePricing && (
                            <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                              ${provider.servicePricing}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                          <span>by {provider.user?.username || "Provider"}</span>
                          {provider.city && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" />
                                {provider.city}
                                {provider.state ? `, ${provider.state}` : ""}
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                          {provider.description ||
                            "Schedule an appointment with this provider during their available hours."}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 tabular-nums">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                        {openSlots} {openSlots === 1 ? "slot" : "slots"} open
                      </span>

                      <button
                        type="button"
                        onClick={() => handleProviderClick(provider)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>View & Book</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              totalElements={totalElements}
              pageSize={6}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
