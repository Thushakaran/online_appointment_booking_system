import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, profileImage } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate("/");
  };

  const getDashboardPath = () => {
    if (role === "ADMIN") return "/admin-dashboard";
    if (role === "PROVIDER") return "/provider-dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (role === "ADMIN") return "Admin Console";
    if (role === "PROVIDER") return "Provider Portal";
    return "My Dashboard";
  };

  const navLinks = [{ to: "/", label: "Home" }];

  if (token && role === "USER") {
    navLinks.push({ to: "/dashboard", label: "Overview" });
    navLinks.push({ to: "/providers", label: "Providers" });
    navLinks.push({ to: "/appointments", label: "Appointments" });
  } else if (role !== "PROVIDER") {
    navLinks.push({ to: "/providers", label: "Providers" });
  }

  const isActive = (path) =>
    location.pathname === path ||
    (path === "/providers" &&
      location.pathname.startsWith("/book-appointment"));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to={token && role === "USER" ? "/dashboard" : "/"}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <FiCalendar className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            AppointFlow
          </span>
        </Link>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                isActive(link.to)
                  ? "text-indigo-600 border-indigo-600"
                  : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {token ? (
            <>
              <Link
                to="/profile"
                aria-label="Open profile"
                title="Profile"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border p-1 transition-colors shrink-0 ${
                  location.pathname === "/profile"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="w-full h-full rounded-full overflow-hidden bg-indigo-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
                  )}
                </span>
              </Link>
              {role !== "USER" && (
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{getDashboardLabel()}</span>
                  <FiChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <FiLogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Get Started</span>
                <FiChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {token ? (
              <>
                <Link
                  to="/profile"
                  aria-label="Open profile"
                  title="Profile"
                  onClick={() => setMobileOpen(false)}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === "/profile"
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-slate-700 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
                    )}
                  </span>
                </Link>
                {role !== "USER" && (
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {getDashboardLabel()}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
