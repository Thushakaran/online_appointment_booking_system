import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

// Icons
import {
  FaUserMd,
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaUserShield,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdDashboard, MdOutlineAdminPanelSettings } from "react-icons/md";
import { AiOutlineLogin, AiOutlineUserAdd } from "react-icons/ai";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[linear-gradient(to_right,#1e1e2f,#2a003f)] backdrop-blur-lg border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          {/* Icon */}
          <FaCalendarCheck className="text-purple-400" size={24} />

          {/* Gradient Text (static, no animation) */}
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            Appointment Booking
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              {/* Common links - only show Browse Providers for non-providers */}
              {role !== "PROVIDER" && (
                <Link
                  to="/providers"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-white transition-colors ${
                    location.pathname === "/providers"
                      ? "text-purple-400 font-semibold"
                      : "hover:text-purple-400"
                  }`}
                >
                  <FaUserMd /> Browse Providers
                </Link>
              )}

              {/* Role-specific navigation */}
              {role === "USER" && (
                <Link
                  to="/appointments"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-white transition-colors ${
                    location.pathname === "/appointments"
                      ? "text-purple-400 font-semibold"
                      : "hover:text-purple-400"
                  }`}
                >
                  <FaCalendarAlt /> My Appointments
                </Link>
              )}

              {role === "PROVIDER" && (
                <Link
                  to="/provider-dashboard"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-white transition-colors ${
                    location.pathname === "/provider-dashboard"
                      ? "text-purple-400 font-semibold"
                      : "hover:text-purple-400"
                  }`}
                >
                  <MdDashboard /> My Dashboard
                </Link>
              )}

              {role === "ADMIN" && (
                <>
                  <Link
                    to="/admin-dashboard"
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-white transition-colors ${
                      location.pathname === "/admin-dashboard"
                        ? "text-purple-400 font-semibold"
                        : "hover:text-purple-400"
                    }`}
                  >
                    <MdOutlineAdminPanelSettings /> Admin Panel
                  </Link>
                  <Link
                    to="/admin/providers"
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-white transition-colors ${
                      location.pathname === "/admin/providers"
                        ? "text-purple-400 font-semibold"
                        : "hover:text-purple-400"
                    }`}
                  >
                    <FaUserShield /> Manage Providers
                  </Link>
                </>
              )}

              {/* User Profile - Show for all users except admin */}
              {role !== "ADMIN" && (
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-500">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-purple-300 hover:text-purple-400 transition-colors"
                  >
                    <FaUser />
                    <span className="font-medium">{user}</span>
                  </Link>
                </div>
              )}

              {/* Logout button */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-500">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white hover:text-red-400 transition-colors"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Public navigation */}
              <Link
                to="/providers"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white transition-colors ${
                  location.pathname === "/providers"
                    ? "text-purple-400 font-semibold"
                    : "hover:text-purple-400"
                }`}
              >
                <FaUserMd /> Browse Providers
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <AiOutlineLogin /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-400 text-white hover:text-purple-400 transition-colors"
              >
                <AiOutlineUserAdd /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
