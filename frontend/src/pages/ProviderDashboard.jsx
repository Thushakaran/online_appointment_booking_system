// import { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { logout } from "../features/auth/authSlice";
// import dayjs from "dayjs";
// import videoBackground from "../assets/video.mp4";

// export default function ProviderDashboard() {
//   const { token, role } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [provider, setProvider] = useState(null);
//   const [availabilities, setAvailabilities] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [availabilityForm, setAvailabilityForm] = useState({
//     availableDate: "",
//   });
//   const [editingAvailability, setEditingAvailability] = useState(null);
//   const [editForm, setEditForm] = useState({ availableDate: "" });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [profileExists, setProfileExists] = useState(false);

//   // Sort appointments: PENDING first (by time), then others
//   const sortAppointments = (appointments) => {
//     return appointments.sort((a, b) => {
//       const statusA = a.status;
//       const statusB = b.status;
//       const isPendingA = statusA === "PENDING";
//       const isPendingB = statusB === "PENDING";

//       // If both are pending, sort by appointment date/time
//       if (isPendingA && isPendingB) {
//         return new Date(a.appointmentDate) - new Date(b.appointmentDate);
//       }
//       // PENDING appointments come first
//       if (isPendingA) return -1;
//       if (isPendingB) return 1;
//       // For non-pending appointments, sort by appointment date/time
//       return new Date(a.appointmentDate) - new Date(b.appointmentDate);
//     });
//   };

//   // Redirect if not logged in or not a provider
//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//     } else if (role !== "PROVIDER") {
//       navigate("/");
//     }
//   }, [token, role, navigate]);

//   // Fetch logged-in provider and availabilities
//   const fetchProviderData = async () => {
//     if (!token) return;
//     try {
//       setLoading(true);
//       const [providerRes, availabilitiesRes, appointmentsRes] =
//         await Promise.all([
//           api.get("/api/providers/me"),
//           api.get("/api/availabilities/my-availabilities"),
//           api.get("/api/appointments/my-appointments"),
//         ]);
//       setProvider(providerRes.data);
//       setAvailabilities(availabilitiesRes.data || []);
//       console.log("Raw appointments data:", appointmentsRes.data);
//       const sortedAppointments = sortAppointments(appointmentsRes.data || []);
//       console.log("Sorted appointments:", sortedAppointments);
//       setAppointments(sortedAppointments);

//       setProfileExists(true);
//       setError("");
//     } catch (err) {
//       console.error(err);
//       if (err.response?.status === 404) {
//         // Provider profile doesn't exist
//         setProfileExists(false);
//         setError("Please complete your provider profile setup first.");
//       } else {
//         setError("Failed to fetch provider info. Make sure you are logged in.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProviderData();
//   }, [token]);

//   // Add availability
//   const handleAddAvailability = async (e) => {
//     e.preventDefault();
//     try {
//       setError("");
//       setMessage("");
//       await api.post("/api/availabilities", {
//         availableDate: availabilityForm.availableDate,
//       });
//       setAvailabilityForm({ availableDate: "" });
//       setMessage("Availability added successfully!");
//       fetchProviderData(); // Refresh availabilities
//       // Clear message after 3 seconds
//       setTimeout(() => setMessage(""), 3000);
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to add availability.");
//       // Clear error after 5 seconds
//       setTimeout(() => setError(""), 5000);
//     }
//   };

//   // Delete availability
//   const handleDeleteAvailability = async (availabilityId) => {
//     if (window.confirm("Are you sure you want to delete this availability?")) {
//       try {
//         setError("");
//         setMessage("");
//         console.log("=== Delete Availability Frontend Debug ===");
//         console.log("Deleting availability with ID:", availabilityId);
//         console.log("Current token:", token);
//         console.log("Current provider:", provider);
//         console.log("Current availabilities:", availabilities);

//         // Log the specific availability being deleted
//         const availabilityToDelete = availabilities.find(
//           (a) => a.id === availabilityId
//         );
//         console.log("Availability to delete:", availabilityToDelete);

//         const response = await api.delete(
//           `/api/availabilities/${availabilityId}`
//         );
//         console.log("Delete response:", response);

//         setMessage("Availability deleted successfully!");
//         fetchProviderData(); // Refresh availabilities
//         // Clear message after 3 seconds
//         setTimeout(() => setMessage(""), 3000);
//       } catch (err) {
//         console.error("=== Delete Availability Error ===");
//         console.error("Delete availability error:", err);
//         console.error("Error response:", err.response);
//         console.error("Error status:", err.response?.status);
//         console.error("Error data:", err.response?.data);
//         console.error("Error message:", err.response?.data?.message);

//         let errorMessage = "Failed to delete availability.";

//         if (err.response?.status === 403) {
//           errorMessage =
//             err.response?.data?.message ||
//             "Access denied. You can only delete your own availabilities.";
//         } else if (err.response?.status === 404) {
//           errorMessage = "Availability not found.";
//         } else if (err.response?.status === 401) {
//           errorMessage = "Authentication failed. Please login again.";
//         } else if (err.response?.data?.message) {
//           errorMessage = err.response.data.message;
//         }

//         setError(errorMessage);
//         // Clear error after 5 seconds
//         setTimeout(() => setError(""), 5000);
//       }
//     }
//   };

//   // Start editing availability
//   const handleStartEdit = (availability) => {
//     setEditingAvailability(availability.id);
//     // Convert the date to the format expected by datetime-local input
//     const dateForInput = dayjs(availability.availableDate).format(
//       "YYYY-MM-DDTHH:mm"
//     );
//     setEditForm({ availableDate: dateForInput });
//   };

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setEditingAvailability(null);
//     setEditForm({ availableDate: "" });
//   };

//   // Update availability
//   const handleUpdateAvailability = async (availabilityId) => {
//     try {
//       setError("");
//       setMessage("");
//       await api.put(`/api/availabilities/${availabilityId}`, {
//         availableDate: editForm.availableDate,
//       });
//       setMessage("Availability updated successfully!");
//       setEditingAvailability(null);
//       setEditForm({ availableDate: "" });
//       fetchProviderData(); // Refresh availabilities
//       // Clear message after 3 seconds
//       setTimeout(() => setMessage(""), 3000);
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to update availability.");
//       // Clear error after 5 seconds
//       setTimeout(() => setError(""), 5000);
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   const goToSetup = () => {
//     navigate("/provider-setup");
//   };

//   if (loading)
//     return (
//       <div className="min-h-[calc(100vh-5rem)] relative flex items-center justify-center">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );

//   // Show setup prompt if profile doesn't exist
//   if (!profileExists) {
//     return (
//       <div className="min-h-[calc(100vh-5rem)] relative">
//         {/* Full Page Video Background */}
//         <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="fixed inset-0 w-full h-full object-cover z-0"
//         >
//           <source src={videoBackground} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>

//         {/* Overlay for readability */}
//         <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

//         <div className="relative z-20 max-w-4xl mx-auto p-8">
//           <header className="flex justify-between items-center mb-8">
//             <h1 className="text-4xl font-bold text-heading-h1">
//               Provider Dashboard
//             </h1>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
//             >
//               Logout
//             </button>
//           </header>

//           <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-8 text-center">
//             <h2 className="text-3xl font-semibold text-heading-h2 mb-4">
//               Complete Your Provider Profile
//             </h2>
//             <p className="text-yellow-100 mb-6 text-lg">
//               You need to set up your provider profile before you can start
//               managing appointments.
//             </p>
//             <button
//               onClick={goToSetup}
//               className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
//             >
//               Set Up Profile
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[calc(100vh-5rem)] relative">
//       {/* Full Page Video Background */}
//       <video
//         autoPlay
//         loop
//         muted
//         playsInline
//         className="fixed inset-0 w-full h-full object-cover z-0"
//       >
//         <source src={videoBackground} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>

//       {/* Overlay for readability */}
//       <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

//       <div className="relative z-20 max-w-6xl mx-auto p-8">
//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold text-heading-h1">
//             Provider Dashboard
//           </h1>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
//           >
//             Logout
//           </button>
//         </header>

//         {error && (
//           <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4 mb-6 text-red-200">
//             {error}
//           </div>
//         )}
//         {message && (
//           <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 mb-6 text-green-200">
//             {message}
//           </div>
//         )}

//         {provider ? (
//           <>
//             {/* Provider Profile Header - Matching User Profile Style */}
//             <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden mb-8">
//               <div className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 backdrop-blur-sm px-6 py-8 text-white flex flex-col sm:flex-row items-center gap-6">
//                 <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
//                   <svg
//                     className="w-12 h-12 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="flex-1 text-center sm:text-left">
//                   <h1 className="text-3xl font-bold text-heading-h1">
//                     {provider?.serviceName || "Provider Profile"}
//                   </h1>
//                   <p className="text-purple-100 mt-1">
//                     {provider?.user?.email || "N/A"}
//                   </p>
//                   <p className="text-purple-200 text-sm mt-1">
//                     Member since {new Date().getFullYear()}
//                   </p>
//                 </div>
//                 <div className="ml-auto">
//                   <button
//                     onClick={() => navigate("/provider-setup")}
//                     className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
//                   >
//                     Edit Profile
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content Area */}
//             <div className="space-y-8">
//               {/* Quick Summary - Enhanced with better styling */}
//               <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
//                 <h2 className="text-3xl font-bold text-heading-h2 mb-6 border-b border-white/30 pb-3">
//                   Dashboard Overview
//                 </h2>
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//                   <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
//                     <div className="text-3xl font-bold text-white mb-2">
//                       {availabilities.length}
//                     </div>
//                     <div className="text-white/90 font-medium">Total Slots</div>
//                   </div>
//                   <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
//                     <div className="text-3xl font-bold text-green-400 mb-2">
//                       {availabilities.filter((a) => !a.isBooked).length}
//                     </div>
//                     <div className="text-white/90 font-medium">Available</div>
//                   </div>
//                   <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
//                     <div className="text-3xl font-bold text-blue-400 mb-2">
//                       {appointments.length}
//                     </div>
//                     <div className="text-white/90 font-medium">
//                       Total Bookings
//                     </div>
//                   </div>
//                   <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
//                     <div className="text-3xl font-bold text-purple-400 mb-2">
//                       {provider?.serviceName ? "Active" : "Setup"}
//                     </div>
//                     <div className="text-white/90 font-medium">Status</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Availability Management - Enhanced layout */}
//               <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:shadow-lg transition-shadow">
//                 <h2 className="text-2xl font-bold text-heading-h2 mb-6 border-b border-white/30 pb-3">
//                   Manage Availabilities
//                 </h2>

//                 {/* Add Availability Form - Enhanced */}
//                 <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-8">
//                   <h3 className="text-lg font-semibold text-heading-h3 mb-4">
//                     Add New Availability
//                   </h3>
//                   <form
//                     onSubmit={handleAddAvailability}
//                     className="flex flex-col lg:flex-row gap-4"
//                   >
//                     <div className="flex-1">
//                       <label className="block text-white/80 font-medium mb-2 text-sm">
//                         Date & Time
//                       </label>
//                       <input
//                         type="datetime-local"
//                         value={availabilityForm.availableDate}
//                         onChange={(e) =>
//                           setAvailabilityForm({
//                             availableDate: e.target.value,
//                           })
//                         }
//                         className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
//                         required
//                       />
//                     </div>
//                     <div className="flex items-end">
//                       <button
//                         type="submit"
//                         className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
//                       >
//                         Add Availability
//                       </button>
//                     </div>
//                   </form>
//                 </div>

//                 {/* Availabilities List - Enhanced */}
//                 <div>
//                   <h3 className="text-xl font-bold mb-6 text-heading-h3">
//                     Your Availabilities ({availabilities.length})
//                   </h3>
//                   {availabilities.length === 0 ? (
//                     <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
//                       <p className="text-gray-300 text-lg mb-2">
//                         No availabilities added yet
//                       </p>
//                       <p className="text-gray-400 text-sm">
//                         Add your first availability to start receiving bookings
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {availabilities.map((availability) => (
//                         <div
//                           key={availability.id}
//                           className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
//                         >
//                           {editingAvailability === availability.id ? (
//                             // Edit mode
//                             <div className="space-y-4">
//                               <div>
//                                 <label className="block text-white/80 font-medium mb-2 text-sm">
//                                   Date & Time
//                                 </label>
//                                 <input
//                                   type="datetime-local"
//                                   value={editForm.availableDate}
//                                   onChange={(e) =>
//                                     setEditForm({
//                                       availableDate: e.target.value,
//                                     })
//                                   }
//                                   className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
//                                   required
//                                 />
//                               </div>
//                               <div className="flex gap-3">
//                                 <button
//                                   onClick={() =>
//                                     handleUpdateAvailability(availability.id)
//                                   }
//                                   className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
//                                 >
//                                   Save Changes
//                                 </button>
//                                 <button
//                                   onClick={handleCancelEdit}
//                                   className="bg-gray-500/80 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-gray-600/80 transition-all duration-300 border border-gray-400/30"
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>
//                             </div>
//                           ) : (
//                             // View mode
//                             <div className="space-y-4">
//                               {/* Card Header */}
//                               <div className="flex justify-between items-start">
//                                 <div>
//                                   <h4 className="text-heading-h4 font-semibold text-lg">
//                                     Availability
//                                   </h4>
//                                 </div>
//                                 <span
//                                   className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                     availability.isBooked
//                                       ? "bg-red-500/20 text-red-300 border border-red-400/30"
//                                       : "bg-green-500/20 text-green-300 border border-green-400/30"
//                                   }`}
//                                 >
//                                   {availability.isBooked
//                                     ? "Booked"
//                                     : "Available"}
//                                 </span>
//                               </div>

//                               {/* Date and Time */}
//                               <div className="flex items-center gap-2 text-gray-300">
//                                 <svg
//                                   className="w-5 h-5 text-blue-400"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                                   />
//                                 </svg>
//                                 <span className="font-medium">
//                                   {dayjs(availability.availableDate).format(
//                                     "MMMM DD, YYYY at HH:mm"
//                                   )}
//                                 </span>
//                               </div>

//                               {/* Action Buttons */}
//                               <div className="flex gap-3 pt-2">
//                                 <button
//                                   onClick={() => handleStartEdit(availability)}
//                                   className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleDeleteAvailability(availability.id)
//                                   }
//                                   className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
//                                 >
//                                   Delete
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* My Bookings Section - Moved from sidebar to main content */}
//               <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:shadow-lg transition-shadow">
//                 <div className="flex justify-between items-center mb-6 border-b border-white/30 pb-3">
//                   <h2 className="text-2xl font-bold text-heading-h2">
//                     My Bookings
//                   </h2>
//                   <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
//                     {appointments.length}
//                   </span>
//                 </div>

//                 {/* Booking Statistics */}
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                     <div className="text-2xl font-bold text-green-400 mb-1">
//                       {
//                         appointments.filter((a) => a.status === "CONFIRMED")
//                           .length
//                       }
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">
//                       Confirmed
//                     </div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                     <div className="text-2xl font-bold text-yellow-400 mb-1">
//                       {
//                         appointments.filter((a) => a.status === "PENDING")
//                           .length
//                       }
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">
//                       Pending
//                     </div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                     <div className="text-2xl font-bold text-red-400 mb-1">
//                       {
//                         appointments.filter((a) => a.status === "CANCELLED")
//                           .length
//                       }
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">
//                       Cancelled
//                     </div>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                     <div className="text-2xl font-bold text-blue-400 mb-1">
//                       {appointments.length}
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">
//                       Total
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-xl font-bold mb-6 text-heading-h3">
//                     Recent Bookings ({appointments.length})
//                   </h3>
//                   {appointments.length === 0 ? (
//                     <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
//                       <div className="text-gray-400 mb-3">
//                         <svg
//                           className="w-12 h-12 mx-auto"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                           />
//                         </svg>
//                       </div>
//                       <p className="text-gray-300 mb-2">No bookings yet</p>
//                       <p className="text-gray-400 text-sm">
//                         Bookings will appear here when users make appointments
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {appointments.map((appointment) => (
//                         <div
//                           key={appointment.id}
//                           className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
//                         >
//                           <div className="space-y-4">
//                             {/* Card Header */}
//                             <div className="flex justify-between items-start">
//                               <div>
//                                 <h4 className="text-heading-h4 font-semibold text-lg">
//                                   Appointment
//                                 </h4>
//                               </div>
//                               <span
//                                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                   appointment.status === "PENDING"
//                                     ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
//                                     : appointment.status === "CONFIRMED"
//                                     ? "bg-green-500/20 text-green-300 border border-green-400/30"
//                                     : appointment.status === "CANCELLED"
//                                     ? "bg-red-500/20 text-red-300 border border-red-400/30"
//                                     : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
//                                 }`}
//                               >
//                                 {appointment.status}
//                               </span>
//                             </div>

//                             {/* Date and Time */}
//                             <div className="flex items-center gap-2 text-gray-300">
//                               <svg
//                                 className="w-5 h-5 text-blue-400"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                                 />
//                               </svg>
//                               <span className="font-medium">
//                                 {appointment.appointmentDate
//                                   ? dayjs(appointment.appointmentDate).format(
//                                       "MMMM DD, YYYY at HH:mm"
//                                     )
//                                   : "N/A"}
//                               </span>
//                             </div>

//                             {/* User Info */}
//                             <div className="bg-white/5 rounded-lg p-4">
//                               <h5 className="text-heading-h5 font-semibold mb-2">
//                                 Client Information
//                               </h5>
//                               <div className="space-y-1 text-gray-300 text-sm">
//                                 <p>
//                                   <span className="font-semibold">Name:</span>{" "}
//                                   {appointment.user?.username || "Unknown User"}
//                                 </p>
//                                 <p>
//                                   <span className="font-semibold">Email:</span>{" "}
//                                   {appointment.user?.email || "N/A"}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 text-center">
//             <p className="text-white text-xl">No provider data found.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout } from "../features/auth/authSlice";
import dayjs from "dayjs";
import videoBackground from "../assets/video.mp4";

// Separate components for better organization
const LoadingSpinner = () => (
  <div className="min-h-[calc(100vh-5rem)] relative flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

const ErrorMessage = ({ error, onDismiss }) => (
  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4 mb-6 text-red-200 flex justify-between items-center">
    <span>{error}</span>
    <button
      onClick={onDismiss}
      className="ml-4 text-red-300 hover:text-red-100"
    >
      ×
    </button>
  </div>
);

const SuccessMessage = ({ message, onDismiss }) => (
  <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 mb-6 text-green-200 flex justify-between items-center">
    <span>{message}</span>
    <button
      onClick={onDismiss}
      className="ml-4 text-green-300 hover:text-green-100"
    >
      ×
    </button>
  </div>
);

const ProfileSetupPrompt = ({ onSetup, onLogout }) => (
  <div className="min-h-[calc(100vh-5rem)] relative">
    <VideoBackground />
    <div className="relative z-20 max-w-4xl mx-auto p-8">
      <DashboardHeader onLogout={onLogout} />
      <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-semibold text-heading-h2 mb-4">
          Complete Your Provider Profile
        </h2>
        <p className="text-yellow-100 mb-6 text-lg">
          You need to set up your provider profile before you can start managing
          appointments.
        </p>
        <button
          onClick={onSetup}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          Set Up Profile
        </button>
      </div>
    </div>
  </div>
);

const VideoBackground = () => (
  <>
    <video
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover z-0"
    >
      <source src={videoBackground} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
  </>
);

const DashboardHeader = ({ onLogout, title = "Provider Dashboard" }) => (
  <header className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-bold text-heading-h1">{title}</h1>
    <button
      onClick={onLogout}
      className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
    >
      Logout
    </button>
  </header>
);

const ProfileHeader = ({ provider, onEditProfile }) => {
  console.log("ProfileHeader received provider:", provider);
  console.log("Provider serviceName in ProfileHeader:", provider?.serviceName);
  console.log("Provider user in ProfileHeader:", provider?.user);

  return (
    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 backdrop-blur-sm px-6 py-8 text-white flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-heading-h1">
            {provider?.serviceName || "Provider Profile"}
          </h1>
          <p className="text-purple-100 mt-1">
            {provider?.user?.email || "N/A"}
          </p>
          <p className="text-purple-200 text-sm mt-1">
            Member since {new Date().getFullYear()}
          </p>
        </div>
        <button
          onClick={onEditProfile}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color = "white" }) => (
  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
    <div className={`text-3xl font-bold text-${color} mb-2`}>{value}</div>
    <div className="text-white/90 font-medium">{title}</div>
  </div>
);

const DashboardOverview = ({ stats }) => (
  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
    <h2 className="text-3xl font-bold text-heading-h2 mb-6 border-b border-white/30 pb-3">
      Dashboard Overview
    </h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Slots" value={stats.totalSlots} />
      <StatCard
        title="Available"
        value={stats.availableSlots}
        color="green-400"
      />
      <StatCard
        title="Total Bookings"
        value={stats.totalBookings}
        color="blue-400"
      />
      <StatCard title="Status" value={stats.status} color="purple-400" />
    </div>
  </div>
);

const AvailabilityForm = ({ form, onFormChange, onSubmit }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-8">
    <h3 className="text-lg font-semibold text-heading-h3 mb-4">
      Add New Availability
    </h3>
    <form onSubmit={onSubmit} className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-white/80 font-medium mb-2 text-sm">
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={form.availableDate}
          onChange={(e) => onFormChange({ availableDate: e.target.value })}
          className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
          required
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          Add Availability
        </button>
      </div>
    </form>
  </div>
);

const AvailabilityCard = ({
  availability,
  isEditing,
  editForm,
  onEdit,
  onUpdate,
  onCancel,
  onDelete,
  onEditFormChange,
}) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
    {isEditing ? (
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 font-medium mb-2 text-sm">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={editForm.availableDate}
            onChange={(e) =>
              onEditFormChange({ availableDate: e.target.value })
            }
            className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onUpdate}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500/80 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-gray-600/80 transition-all duration-300 border border-gray-400/30"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h4 className="text-heading-h4 font-semibold text-lg">
            Availability
          </h4>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              availability.isBooked
                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                : "bg-green-500/20 text-green-300 border border-green-400/30"
            }`}
          >
            {availability.isBooked ? "Booked" : "Available"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">
            {dayjs(availability.availableDate).format("MMMM DD, YYYY at HH:mm")}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    )}
  </div>
);

const AppointmentCard = ({ appointment }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h4 className="text-heading-h4 font-semibold text-lg">Appointment</h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            appointment.status === "PENDING"
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
              : appointment.status === "CONFIRMED"
              ? "bg-green-500/20 text-green-300 border border-green-400/30"
              : appointment.status === "CANCELLED"
              ? "bg-red-500/20 text-red-300 border border-red-400/30"
              : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-gray-300">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-medium">
          {appointment.appointmentDate
            ? dayjs(appointment.appointmentDate).format(
                "MMMM DD, YYYY at HH:mm"
              )
            : "N/A"}
        </span>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="text-heading-h5 font-semibold mb-2">
          Client Information
        </h5>
        <div className="space-y-1 text-gray-300 text-sm">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {appointment.user?.username || "Unknown User"}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {appointment.user?.email || "N/A"}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function ProviderDashboard() {
  const { token, role, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [provider, setProvider] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    availableDate: "",
  });
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editForm, setEditForm] = useState({ availableDate: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  // Sort appointments utility
  const sortAppointments = useCallback((appointments) => {
    if (!Array.isArray(appointments)) {
      console.log("Appointments is not an array:", appointments);
      return [];
    }
    return appointments.sort((a, b) => {
      const isPendingA = a.status === "PENDING";
      const isPendingB = b.status === "PENDING";

      if (isPendingA && isPendingB) {
        return new Date(a.appointmentDate) - new Date(b.appointmentDate);
      }
      if (isPendingA) return -1;
      if (isPendingB) return 1;
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });
  }, []);

  // Computed values
  const dashboardStats = useMemo(
    () => ({
      totalSlots: availabilities.length,
      availableSlots: availabilities.filter((a) => !a.isBooked).length,
      totalBookings: appointments.length,
      status: provider?.serviceName ? "Active" : "Setup",
    }),
    [availabilities, appointments, provider]
  );

  const appointmentStats = useMemo(
    () => ({
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      total: appointments.length,
    }),
    [appointments]
  );

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Authentication check
  useEffect(() => {
    if (!token || role !== "PROVIDER") {
      navigate("/");
    }
  }, [token, role, navigate]);

  // Fetch data
  const fetchProviderData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      console.log("Fetching provider data...");
      console.log("Token:", token ? "Present" : "Missing");

      // Try to get the provider profile first
      let providerRes;
      try {
        providerRes = await api.get("/api/providers/me");
        console.log("Provider response:", providerRes.data);
        console.log("Provider serviceName:", providerRes.data?.serviceName);
        console.log("Provider user:", providerRes.data?.user);
        console.log(
          "Provider structure:",
          JSON.stringify(providerRes.data, null, 2)
        );
        setProvider(providerRes.data);
        setProfileExists(true);
        setError("");
        console.log("Profile exists set to true");
      } catch (providerErr) {
        console.error("Error fetching provider profile:", providerErr);
        console.error("Provider error status:", providerErr.response?.status);

        // If the /me endpoint fails, try to find the provider in the general list
        if (
          providerErr.response?.status === 404 ||
          providerErr.response?.status === 403
        ) {
          console.log("Trying to find provider in general list...");
          try {
            const allProvidersRes = await api.get("/api/providers");
            const currentUser = user || localStorage.getItem("username");

            console.log("Current user:", currentUser);
            console.log("All providers:", allProvidersRes.data);

            const userProvider = allProvidersRes.data.find(
              (p) => p.user && p.user.username === currentUser
            );

            if (userProvider) {
              console.log("Found provider in general list:", userProvider);
              console.log(
                "Provider serviceName from fallback:",
                userProvider?.serviceName
              );
              console.log("Provider user from fallback:", userProvider?.user);
              setProvider(userProvider);
              setProfileExists(true);
              setError("");
              console.log("Profile exists set to true from general list");
            } else {
              console.log("No provider found for user:", currentUser);
              setProfileExists(false);
              setError("Please complete your provider profile setup first.");
            }
          } catch (generalErr) {
            console.error("Error fetching general providers:", generalErr);
            setProfileExists(false);
            setError(
              "Failed to fetch provider info. Make sure you are logged in."
            );
          }
        } else {
          setProfileExists(false);
          setError(
            "Failed to fetch provider info. Make sure you are logged in."
          );
        }
      }

      // Fetch availabilities and appointments
      try {
        const [availabilitiesRes, appointmentsRes] = await Promise.all([
          api.get("/api/availabilities/my-availabilities"),
          api.get("/api/appointments/my-appointments"),
        ]);

        console.log("Availabilities response:", availabilitiesRes.data);
        console.log("Appointments response:", appointmentsRes.data);
        setAvailabilities(availabilitiesRes.data || []);
        setAppointments(sortAppointments(appointmentsRes.data || []));
      } catch (otherErr) {
        console.error("Error fetching availabilities/appointments:", otherErr);
        // Don't fail the entire request for these
        setAvailabilities([]);
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching provider data:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);

      setProfileExists(false);
      setError("Failed to fetch provider info. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  }, [token, sortAppointments, user]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  // Event handlers
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      await api.post("/api/availabilities", availabilityForm);
      setAvailabilityForm({ availableDate: "" });
      setMessage("Availability added successfully!");
      fetchProviderData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add availability.");
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm("Are you sure you want to delete this availability?"))
      return;

    try {
      setError("");
      setMessage("");
      await api.delete(`/api/availabilities/${availabilityId}`);
      setMessage("Availability deleted successfully!");
      fetchProviderData();
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to delete availability.";

      if (err.response?.status === 403) {
        errorMessage =
          "Access denied. You can only delete your own availabilities.";
      } else if (err.response?.status === 404) {
        errorMessage = "Availability not found.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 400) {
        // Handle business logic errors (like associated appointments)
        errorMessage = err.response.data || "Cannot delete this availability.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    }
  };

  const handleStartEdit = (availability) => {
    setEditingAvailability(availability.id);
    setEditForm({
      availableDate: dayjs(availability.availableDate).format(
        "YYYY-MM-DDTHH:mm"
      ),
    });
  };

  const handleCancelEdit = () => {
    setEditingAvailability(null);
    setEditForm({ availableDate: "" });
  };

  const handleUpdateAvailability = async (availabilityId) => {
    try {
      setError("");
      setMessage("");
      await api.put(`/api/availabilities/${availabilityId}`, editForm);
      setMessage("Availability updated successfully!");
      setEditingAvailability(null);
      setEditForm({ availableDate: "" });
      fetchProviderData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update availability.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const goToSetup = () => navigate("/provider-setup");
  const goToEditProfile = () => navigate("/provider-setup");

  // Render loading state
  if (loading) return <LoadingSpinner />;

  // Render setup prompt if profile doesn't exist
  if (!profileExists) {
    return <ProfileSetupPrompt onSetup={goToSetup} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] relative">
      <VideoBackground />

      <div className="relative z-20 max-w-6xl mx-auto p-8">
        <DashboardHeader onLogout={handleLogout} />

        {error && <ErrorMessage error={error} onDismiss={() => setError("")} />}
        {message && (
          <SuccessMessage message={message} onDismiss={() => setMessage("")} />
        )}

        {provider && (
          <>
            <ProfileHeader
              provider={provider}
              onEditProfile={goToEditProfile}
            />

            <div className="space-y-8">
              <DashboardOverview stats={dashboardStats} />

              {/* Availability Management */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold text-heading-h2 mb-6 border-b border-white/30 pb-3">
                  Manage Availabilities
                </h2>

                <AvailabilityForm
                  form={availabilityForm}
                  onFormChange={setAvailabilityForm}
                  onSubmit={handleAddAvailability}
                />

                <div>
                  <h3 className="text-xl font-bold mb-6 text-heading-h3">
                    Your Availabilities ({availabilities.length})
                  </h3>

                  {availabilities.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
                      <p className="text-gray-300 text-lg mb-2">
                        No availabilities added yet
                      </p>
                      <p className="text-gray-400 text-sm">
                        Add your first availability to start receiving bookings
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availabilities.map((availability) => (
                        <AvailabilityCard
                          key={availability.id}
                          availability={availability}
                          isEditing={editingAvailability === availability.id}
                          editForm={editForm}
                          onEdit={() => handleStartEdit(availability)}
                          onUpdate={() =>
                            handleUpdateAvailability(availability.id)
                          }
                          onCancel={handleCancelEdit}
                          onDelete={() =>
                            handleDeleteAvailability(availability.id)
                          }
                          onEditFormChange={setEditForm}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bookings Section */}
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-6 border-b border-white/30 pb-3">
                  <h2 className="text-2xl font-bold text-heading-h2">
                    My Bookings
                  </h2>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {appointments.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    title="Confirmed"
                    value={appointmentStats.confirmed}
                    color="green-400"
                  />
                  <StatCard
                    title="Pending"
                    value={appointmentStats.pending}
                    color="yellow-400"
                  />
                  <StatCard
                    title="Cancelled"
                    value={appointmentStats.cancelled}
                    color="red-400"
                  />
                  <StatCard
                    title="Total"
                    value={appointmentStats.total}
                    color="blue-400"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 text-heading-h3">
                    Recent Bookings ({appointments.length})
                  </h3>

                  {appointments.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
                      <div className="text-gray-400 mb-3">
                        <svg
                          className="w-12 h-12 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-300 mb-2">No bookings yet</p>
                      <p className="text-gray-400 text-sm">
                        Bookings will appear here when users make appointments
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
