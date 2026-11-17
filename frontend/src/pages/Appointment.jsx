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

  const getAppointmentDate = (appointment) => {
    if (appointment.appointmentDate) {
      return new Date(appointment.appointmentDate);
    }
    if (appointment.availability?.availableDate) {
      return new Date(appointment.availability.availableDate);
    }
    return new Date(0);
  };

  const sortAppointments = (appointments) => {
    return appointments.sort((a, b) => {
      const statusA = a.status;
      const statusB = b.status;
      const isPendingA = statusA === "PENDING";
      const isPendingB = statusB === "PENDING";

      if (isPendingA && isPendingB) {
        return getAppointmentDate(a) - getAppointmentDate(b);
      }
      if (isPendingA) return -1;
      if (isPendingB) return 1;
      return getAppointmentDate(a) - getAppointmentDate(b);
    });
  };

  const load = async (uid) => {
    try {
      const res = await api.get(`/api/appointments/user/${uid}`);
      const sortedAppointments = sortAppointments(res.data || []);
      setItems(sortedAppointments);
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
      if (status === "CANCELLED") {
        await api.put(`/api/appointments/${id}/cancel`);
        setMsg(`Successfully cancelled appointment`);
      } else if (status === "CONFIRMED") {
        await api.put(`/api/appointments/${id}/confirm`);
        setMsg(`Successfully confirmed appointment`);
      } else {
        // For other status updates, use the original endpoint (for providers)
        await api.put(`/api/appointments/${id}/status`, { status });
        setMsg(`Successfully updated appointment to ${status}`);
      }
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
        <h2 className="text-3xl font-bold mb-8 text-heading-h2 text-center">
          My Appointments
        </h2>
        {msg && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6 text-center">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:scale-[1.02] hover:bg-white/30 transition-all duration-300"
              >
                {/* Header: Title + Status */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-heading-h3">
                    Appointment
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                {/* Body */}
                <div className="space-y-1 text-sm text-white/80 mb-4">
                  <p>
                    <span className="font-medium">Provider:</span>{" "}
                    {appointment.provider?.user?.username || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Service:</span>{" "}
                    {appointment.provider?.serviceName || "N/A"}
                  </p>
                  <p className="text-white font-medium mt-2">
                    📅{" "}
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

                {/* Footer: Status Change */}
                <div>
                  <select
                    className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 rounded-xl p-2 text-sm outline-none transition-all duration-300 text-white"
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
