import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiBriefcase,
  FiX,
  FiStar,
  FiMessageSquare,
  FiCalendar,
} from "react-icons/fi";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import DashboardShell from "../components/DashboardShell";

const SEARCH_TYPES = [
  { value: "general", label: "All Fields" },
  { value: "service", label: "Service" },
  { value: "city", label: "City" },
  { value: "description", label: "Specialty" },
];

function StarRow({ rating, size = "w-3.5 h-3.5" }) {
  const rounded = Math.round(rating || 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`${size} ${
            star <= rounded
              ? "text-amber-500 fill-amber-400"
              : "text-slate-200 fill-slate-100"
          }`}
        />
      ))}
    </span>
  );
}

export default function Providers() {
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);
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
  const [maxPrice, setMaxPrice] = useState("");
  const [providerRatings, setProviderRatings] = useState({});
  const [activeReviewsProvider, setActiveReviewsProvider] = useState(null);

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
      const list = data.content || [];
      setProviders(list);

      const reviewLists = await Promise.all(
        list.map((provider) =>
          api
            .get(`/api/reviews/provider/${provider.id}`)
            .then((r) => r.data || [])
            .catch(() => [])
        )
      );

      setProviderRatings(
        Object.fromEntries(
          list.map((provider, index) => {
            const reviews = reviewLists[index];
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            return [
              provider.id,
              {
                count: reviews.length,
                average: reviews.length ? total / reviews.length : 0,
                reviews,
              },
            ];
          })
        )
      );

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

  const filteredProviders = useMemo(() => {
    const cap = Number(maxPrice);
    if (!maxPrice || Number.isNaN(cap) || cap <= 0) return providers;
    return providers.filter((p) => {
      const priceMatch = String(p.servicePricing || "").match(/[\d.]+/);
      if (!priceMatch) return true;
      const price = Number(priceMatch[0]);
      return Number.isNaN(price) || price <= cap;
    });
  }, [providers, maxPrice]);

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
    setMaxPrice("");
    setCurrentPage(0);
  };

  const modalRatingInfo = activeReviewsProvider
    ? providerRatings[activeReviewsProvider.id] || {
        count: 0,
        average: 0,
        reviews: [],
      }
    : null;

  const searchForm = (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center"
    >
      <div className="relative flex-1 min-w-0">
        <FiSearch
          className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
            onClick={() => {
              setSearchInput("");
              setSearchTerm("");
              setCurrentPage(0);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
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
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                searchType === t.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-36 shrink-0">
          <label htmlFor="max-price-filter" className="sr-only">
            Maximum price
          </label>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
            Max $
          </span>
          <input
            id="max-price-filter"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="w-full pl-12 pr-7 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          {maxPrice && (
            <button
              type="button"
              onClick={() => setMaxPrice("")}
              aria-label="Clear max price"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  );

  const directoryContent = (
    <>
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
        ) : filteredProviders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FiSearch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900">
              No providers match your filters
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {maxPrice && providers.length > 0
                ? `No specialists on this page are priced at $${maxPrice} or below.`
                : searchTerm
                ? `No service providers matched "${searchTerm}".`
                : "No service providers are currently listed."}
            </p>
            {(searchTerm || maxPrice) && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => {
                const showFallback =
                  !provider.profileImage || failedImages[provider.id];
                const ratingInfo = providerRatings[provider.id] || {
                  count: 0,
                  average: 0,
                  reviews: [],
                };

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

                        {/* Clean Rating & Review Trigger */}
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                          <div
                            className="flex items-center gap-1.5"
                            aria-label={
                              ratingInfo.count
                                ? `${ratingInfo.average.toFixed(1)} out of 5 from ${ratingInfo.count} reviews`
                                : "No reviews yet"
                            }
                          >
                            <StarRow rating={ratingInfo.average} />
                            <span className="font-semibold text-slate-900 font-mono tabular-nums">
                              {ratingInfo.count ? ratingInfo.average.toFixed(1) : "New"}
                            </span>
                            <span className="text-slate-500 tabular-nums">
                              · {ratingInfo.count}{" "}
                              {ratingInfo.count === 1 ? "review" : "reviews"}
                            </span>
                          </div>

                          {ratingInfo.count > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveReviewsProvider(provider)}
                              className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                            >
                              <FiMessageSquare className="w-3 h-3" aria-hidden="true" />
                              <span>Read reviews</span>
                            </button>
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
    </>
  );

  const reviewsModal = activeReviewsProvider && modalRatingInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="provider-reviews-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="provider-reviews-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {activeReviewsProvider.serviceName}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <StarRow rating={modalRatingInfo.average} size="w-3.5 h-3.5" />
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {modalRatingInfo.average.toFixed(1)} out of 5
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {modalRatingInfo.count}{" "}
                    {modalRatingInfo.count === 1 ? "client review" : "client reviews"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewsProvider(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close reviews"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 px-6">
              {modalRatingInfo.reviews.map((review) => (
                <div key={review.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center shrink-0">
                        {(review.reviewer || "C").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {review.reviewer}
                        </p>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {dayjs(review.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      <StarRow rating={review.rating} size="w-3.5 h-3.5" />
                      <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveReviewsProvider(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = activeReviewsProvider;
                  setActiveReviewsProvider(null);
                  handleProviderClick(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              >
                <span>Select Time</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );

  if (token) {
    return (
      <DashboardShell
        title="Service Providers"
        breadcrumb="Directory"
        actions={
          role === "USER" ? (
            <Link
              to="/appointments"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <FiCalendar className="w-4 h-4" aria-hidden="true" />
              <span>My Appointments</span>
            </Link>
          ) : null
        }
      >
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-sm text-slate-600">
                Select a specialist to view real-time availability, client reviews, and
                book your appointment.
              </p>
              <span className="text-xs font-medium text-slate-500 tabular-nums shrink-0">
                {loading
                  ? "Loading..."
                  : `${totalElements} provider${totalElements === 1 ? "" : "s"} listed`}
              </span>
            </div>
            {searchForm}
          </div>

          {directoryContent}
        </div>
        {reviewsModal}
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Public Header Band */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Service Providers
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Select a specialist to view real-time availability, client reviews, and
                book your appointment.
              </p>
            </div>
            <p className="text-sm text-slate-500 tabular-nums">
              {loading
                ? "Loading..."
                : `${totalElements} provider${totalElements === 1 ? "" : "s"} listed`}
            </p>
          </div>

          <div className="mt-6">{searchForm}</div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {directoryContent}
      </div>

      {reviewsModal}
    </div>
  );
}
