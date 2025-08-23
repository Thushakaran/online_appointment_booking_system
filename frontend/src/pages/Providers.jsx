import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import dayjs from "dayjs";
import VideoBackground from "../components/VideoBackground";

export default function Providers() {
  const { userId, token, role } = useSelector((state) => state.auth);
  const [providers, setProviders] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const pRes = await api.get("/api/providers"); // this should now include availabilities
        setProviders(pRes.data || []);

        // Test authentication by calling a protected endpoint
        if (token) {
          try {
            const testRes = await api.get("/api/users/me");
            console.log("Auth test successful:", testRes.data);
          } catch (authErr) {
            console.error("Auth test failed:", authErr);
          }
        }
      } catch {
        setErr("Failed to load providers");
      }
    })();
  }, [token]);

  const book = async (provider, slot) => {
    // Check authentication using Redux state
    if (!userId || !token) {
      setErr("Please login to book appointments");
      return;
    }

    setErr("");
    setMsg("");

    // First test if we can access a simple authenticated endpoint
    try {
      const authTest = await api.get("/api/users/me");
      console.log("Pre-booking auth test successful:", authTest.data);
    } catch (authErr) {
      console.error("Pre-booking auth test failed:", authErr);
      setErr("Authentication test failed. Please login again.");
      return;
    }

    try {
      // First, let's try a simpler payload structure
      const payload = {
        user: { id: Number(userId) },
        provider: { id: Number(provider.id) },
        availability: { id: Number(slot.id) },
        appointmentDate: slot.availableDate,
      };

      console.log("Booking payload:", payload);
      console.log("Token exists:", !!token);
      console.log(
        "Token preview:",
        token ? token.substring(0, 20) + "..." : "No token"
      );
      console.log("User ID:", userId, "Type:", typeof userId);
      console.log("Provider ID:", provider.id, "Type:", typeof provider.id);
      console.log("Slot ID:", slot.id, "Type:", typeof slot.id);

      // Try the booking request with additional headers for debugging
      const response = await api.post("/api/appointments", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Booking successful:", response.data);
      setMsg(`Successfully booked appointment!`);

      // reload providers (to refresh slots)
      const r = await api.get("/api/providers");
      setProviders(r.data || []);

      // Clear message after 5 seconds
      setTimeout(() => setMsg(""), 5000);
    } catch (e) {
      console.error("Booking error details:", {
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        headers: e?.response?.headers,
        config: e?.config,
      });

      let errorMessage = "Booking failed. Please try again.";

      if (e?.response?.status === 403) {
        errorMessage =
          "Access denied. The server rejected your request. Check if you have the correct role.";
      } else if (e?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (e?.response?.status === 400) {
        errorMessage =
          "Bad request. " +
          (e?.response?.data?.message || "Invalid data sent to server.");
      } else if (e?.response?.status === 409) {
        errorMessage =
          "This time slot is already booked. Please choose another slot.";
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      }

      setErr(errorMessage);

      // Clear error after 8 seconds
      setTimeout(() => setErr(""), 8000);
    }
  };

  return (
    <VideoBackground>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-white">All Providers</h2>

        {err && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
            {err}
          </div>
        )}
        {msg && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
            {msg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:bg-white/30 transition-all duration-300"
            >
              <h3 className="font-semibold text-xl text-white mb-2">
                {p.user?.username || "Unknown User"}
              </h3>
              <p className="text-white/80 mb-2">{p.serviceName || "-"}</p>
              <p className="text-white/60 mb-3">{p.description || "-"}</p>

              <div className="mt-4">
                <h4 className="font-medium mb-3 text-white">Available Slots</h4>
                {p.availabilities?.length === 0 ? (
                  <p className="text-white/60 text-sm">No open slots.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {p.availabilities.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-sm"
                      >
                        <div className="text-white mb-2">
                          {s.availableDate
                            ? dayjs(s.availableDate).format("YYYY-MM-DD HH:mm")
                            : "Date: N/A"}
                        </div>
                        {token && role === "USER" ? (
                          <button
                            onClick={() => book(p, s)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Book
                          </button>
                        ) : (
                          <div className="w-full bg-white/20 text-white/60 px-3 py-2 rounded-lg text-center text-sm">
                            {!token
                              ? "Login to book"
                              : role !== "USER"
                              ? "USER role required"
                              : "Not available"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VideoBackground>
  );
}
