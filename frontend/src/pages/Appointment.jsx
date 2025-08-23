import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import dayjs from "dayjs";
import VideoBackground from "../components/VideoBackground";

export default function Appointments() {
  const { userId } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (uid) => {
    try {
      const res = await api.get(`/api/appointments/user/${uid}`);
      setItems(res.data || []);
    } catch (e) {
      console.error("Load appointments error:", e);
      if (e?.response?.status === 403) {
        setErr("Access denied. Please make sure you are logged in.");
      } else if (e?.response?.status === 401) {
        setErr("Authentication failed. Please login again.");
      } else {
        setErr("Failed to load appointments. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (userId) {
      load(userId);
      setLoading(false);
    } else {
      setErr("Please login to view your appointments");
      setLoading(false);
    }
  }, [userId]);

  const updateStatus = async (id, status) => {
    setErr("");
    setMsg("");
    try {
      await api.put(`/api/appointments/${id}/status`, { status });
      setMsg(`Successfully updated appointment #${id} to ${status}`);
      await load(userId);
    } catch (e) {
      console.error("Update status error:", e);
      if (e?.response?.status === 403) {
        setErr("Access denied. Please make sure you are logged in.");
      } else if (e?.response?.status === 401) {
        setErr("Authentication failed. Please login again.");
      } else {
        setErr(
          e?.response?.data?.message ||
            "Failed to update status. Please try again."
        );
      }
    }
  };

  if (loading)
    return (
      <VideoBackground>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center py-8">
            <p className="text-white text-xl">Loading appointments...</p>
          </div>
        </div>
      </VideoBackground>
    );

  if (err)
    return (
      <VideoBackground>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-4">
            {err}
          </div>
        </div>
      </VideoBackground>
    );

  return (
    <VideoBackground>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-white">My Appointments</h2>
        {msg && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
            {msg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white text-xl mb-2">No appointments found.</p>
            <p className="text-white/60">
              Book your first appointment from the providers page!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:bg-white/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Appointment
                    </h3>
                    <p className="text-white/80">
                      Provider:{" "}
                      {appointment.provider?.user?.username || "Unknown"}
                    </p>
                    <p className="text-white/80">
                      Service: {appointment.provider?.serviceName || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === "CONFIRMED"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : appointment.status === "CANCELLED"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-white">
                    <strong>Date:</strong>{" "}
                    {appointment.appointmentDate
                      ? dayjs(appointment.appointmentDate).format(
                          "YYYY-MM-DD HH:mm"
                        )
                      : appointment.availability?.availableDate
                      ? dayjs(appointment.availability.availableDate).format(
                          "YYYY-MM-DD HH:mm"
                        )
                      : "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    className="bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-3 text-sm outline-none transition-all duration-300 text-white"
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) updateStatus(appointment.id, val);
                    }}
                  >
                    <option value="" className="bg-gray-800">
                      Change Status...
                    </option>
                    <option value="CANCELLED" className="bg-gray-800">
                      Cancel
                    </option>
                    <option value="CONFIRMED" className="bg-gray-800">
                      Confirm
                    </option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VideoBackground>
  );
}
