import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiBriefcase,
  FiX,
} from "react-icons/fi";
import api from "../api/axios";
import Pagination from "../components/Pagination";

const SEARCH_TYPES = [
  { value: "general", label: "All Fields" },
  { value: "service", label: "Service" },
  { value: "city", label: "City" },
  { value: "description", label: "Specialty" },
];

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [err, setErr] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("general");
  const [failedImages, setFailedImages] = useState({});

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
        response = await api.get(`/api/providers/paginated?page=${currentPage}&size=6`);
      }

      const data = response.data;
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

  const handleSearchSubmit = (e) => {
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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header Band */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Service Providers
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Select a specialist to view real-time availability and book your
                appointment.
              </p>
            </div>
            <p className="text-sm text-slate-500 tabular-nums">
              {loading ? "Loading..." : `${totalElements} provider${totalElements === 1 ? "" : "s"} found`}
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center"
          >
            <div className="relative flex-1">
              <FiSearch
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search by service, city, or provider name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              {(searchInput || searchTerm) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Search scope"
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
              >
                {SEARCH_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setSearchType(t.value);
                      setCurrentPage(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      searchType === t.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {err && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-6">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FiSearch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900">
              No providers found
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm
                ? `No service providers matched "${searchTerm}".`
                : "No service providers are currently listed."}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Reset search filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => {
                const showFallback =
                  !provider.profileImage || failedImages[provider.id];
                return (
                  <article
                    key={provider.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                        {showFallback ? (
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-indigo-50 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-2">
                              <FiBriefcase className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                              {provider.user?.username || "Verified Provider"}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={provider.profileImage}
                            alt={provider.serviceName}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [provider.id]: true,
                              }))
                            }
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {provider.serviceName}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                          <span>{provider.user?.username || "Specialist"}</span>
                          {provider.city && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" aria-hidden="true" />
                                {provider.city}
                                {provider.state ? `, ${provider.state}` : ""}
                              </span>
                            </>
                          )}
                        </div>
                        {provider.description && (
                          <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {provider.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                        {provider.servicePricing
                          ? `$${provider.servicePricing}`
                          : "Standard consultation"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleProviderClick(provider)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Select Time</span>
                        <FiArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              totalElements={totalElements}
              pageSize={6}
            />
          </>
        )}
      </div>
    </div>
  );
}
