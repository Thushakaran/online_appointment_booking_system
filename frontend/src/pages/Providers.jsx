import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VideoBackground from "../components/VideoBackground";
import Pagination from "../components/Pagination";

export default function Providers() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("general"); // general, service, city, description

  useEffect(() => {
    fetchProviders();
  }, [currentPage, searchTerm, searchType]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm.trim()) {
        // Use search endpoints with pagination
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
        // Use regular paginated endpoint
        response = await api.get(
          `/api/providers/paginated?page=${currentPage}&size=6`
        );
      }

      const data = response.data;
      setProviders(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setHasNext(data.hasNext || false);
      setHasPrevious(data.hasPrevious || false);
      setErr("");

      // Test authentication by calling a protected endpoint
      if (token) {
        try {
          const testRes = await api.get("/api/users/me");
          console.log("Auth test successful:", testRes.data);
        } catch (authErr) {
          console.error("Auth test failed:", authErr);
        }
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setErr("Failed to load providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderClick = (provider) => {
    // Navigate to booking page with provider details
    navigate(`/book-appointment/${provider.id}`, {
      state: { provider },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchType("general");
    setCurrentPage(0);
  };

  return (
    <VideoBackground>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-heading-h2">
          Available Service Providers
        </h2>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4 mb-6 relative z-30"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2 relative z-40">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 relative z-50"
              style={{ zIndex: 50 }}
            >
              <option value="general" className="bg-gray-800 text-white">
                General Search
              </option>
              <option value="service" className="bg-gray-800 text-white">
                Service Name
              </option>
              <option value="city" className="bg-gray-800 text-white">
                City
              </option>
              <option value="description" className="bg-gray-800 text-white">
                Description
              </option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-white/80">
            {searchTerm
              ? `Search results for "${searchTerm}"`
              : "All providers"}
          </div>
        </div>

        {err && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {err}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Providers Grid */}
        {!loading && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleProviderClick(provider)}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl"
                >
                  {/* Provider Image */}
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                    {provider.profileImage ? (
                      <img
                        src={provider.profileImage}
                        alt={provider.serviceName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white/60 text-4xl">📷</div>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {provider.serviceName}
                    </h3>
                    <p className="text-white/80 text-sm">
                      by {provider.user?.username || "Unknown"}
                    </p>
                    {provider.city && (
                      <p className="text-white/60 text-sm">
                        📍 {provider.city}
                      </p>
                    )}
                    {provider.description && (
                      <p className="text-white/70 text-sm line-clamp-2">
                        {provider.description}
                      </p>
                    )}
                    {provider.servicePricing && (
                      <p className="text-purple-300 font-semibold">
                        ${provider.servicePricing}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {providers.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-white/60 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No providers found
                </h3>
                <p className="text-white/60">
                  {searchTerm
                    ? `No providers match your search for "${searchTerm}"`
                    : "No providers are currently available"}
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              totalElements={totalElements}
              pageSize={6}
            />
          </>
        )}
      </div>
    </VideoBackground>
  );
}
