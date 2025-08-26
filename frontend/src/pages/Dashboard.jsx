import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import videoBackground from "../assets/video.mp4";
import { dashboardAPI } from "../api/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Dashboard: Starting to fetch stats...');
        const data = await dashboardAPI.getStats();
        console.log('Dashboard: Received stats data:', data);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set default values if API fails
        setStats({
          totalProviders: 0,
          totalAppointments: 0,
          upcomingAppointments: 0,
          totalUsers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] relative">
      {/* Full Page Video Background */}
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

      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-10 h-96 md:h-[500px]">
          <div className="h-full flex items-center p-8 md:p-12">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-heading-h1">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Appointment Booking
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 leading-relaxed">
                Experience seamless appointment scheduling with our intuitive
                platform. Browse providers, check real-time availability, and
                book your appointments with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/providers"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center cursor-pointer border-none"
                >
                  <span className="relative z-10">View Providers</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/appointments"
                  className="group bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition-all duration-300 text-center cursor-pointer"
                >
                  My Appointments
                </Link>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-blue-400/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Statistics Section */}
        <div className="mb-12 px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Providers Stats */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {loading ? "..." : stats.totalProviders}+
              </div>
              <div className="text-gray-100 text-sm">Providers</div>
            </div>

            {/* Total Appointments Stats */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {loading ? "..." : stats.totalAppointments}+
              </div>
              <div className="text-gray-100 text-sm">Bookings</div>
            </div>

            {/* Upcoming Appointments Stats */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {loading ? "..." : stats.upcomingAppointments}
              </div>
              <div className="text-gray-100 text-sm">Upcoming</div>
            </div>

            {/* Total Users Stats */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {loading ? "..." : stats.totalUsers}+
              </div>
              <div className="text-gray-100 text-sm">Users</div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6 p-8">
          {/* Providers Card */}
          <Link
            to="/providers"
            className="group relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-heading-h3 group-hover:text-blue-400 transition-colors">
                Providers
              </h3>
              <p className="text-gray-100 leading-relaxed">
                Discover qualified providers and explore their available time
                slots.
              </p>
            </div>
          </Link>

          {/* Appointments Card */}
          <Link
            to="/appointments"
            className="group relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-heading-h3 group-hover:text-green-400 transition-colors">
                My Appointments
              </h3>
              <p className="text-gray-100 leading-relaxed">
                View, manage, and track all your upcoming and past appointments.
              </p>
            </div>
          </Link>

          {/* Profile Card */}
          <Link
            to="/profile"
            className="group relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-heading-h3 group-hover:text-purple-400 transition-colors">
                Profile
              </h3>
              <p className="text-gray-100 leading-relaxed">
                Manage your account details, preferences, and personal
                information.
              </p>
            </div>
          </Link>
        </div>

        {/* Stats / Features Section */}
        <div className="mt-16 text-center px-4 md:px-0">
          <h2 className="text-3xl font-bold text-heading-h2 mb-4">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Lightning Fast */}
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-heading-h3">
                Lightning Fast
              </h3>
              <p>
                Book appointments in seconds with our streamlined interface.
              </p>
            </div>

            {/* 100% Reliable */}
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-heading-h3">
                100% Reliable
              </h3>
              <p>Trusted by thousands of users for secure booking.</p>
            </div>

            {/* 24/7 Available */}
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-heading-h3">
                24/7 Available
              </h3>
              <p>Access your appointments anytime, anywhere.</p>
            </div>
          </div>
        </div>

        {/* Service Features Section */}
        <div className="mt-16 px-4 md:px-0">
          <h2 className="text-3xl font-bold text-heading-h2 mb-8 text-center">
            Our Services
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Find Specialists */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                Find Specialists
              </h3>
              <p className="text-gray-100 text-sm">
                Search by specialty or location
              </p>
            </div>

            {/* Emergency Booking */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                Emergency Booking
              </h3>
              <p className="text-gray-100 text-sm">Book urgent appointments</p>
            </div>

            {/* Reschedule */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Reschedule</h3>
              <p className="text-gray-100 text-sm">
                Change existing appointments
              </p>
            </div>

            {/* Telemedicine */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                Telemedicine
              </h3>
              <p className="text-gray-100 text-sm">Virtual consultations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
