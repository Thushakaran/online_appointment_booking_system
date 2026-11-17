import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, user } = useSelector((state) => state.auth);
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

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      location.pathname === path
        ? "text-indigo-600"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          AppointFlow
        </Link>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkClass("/")}>
            Overview
          </Link>
          {role !== "PROVIDER" && (
            <Link to="/providers" className={navLinkClass("/providers")}>
              Providers
            </Link>
          )}
          {token && role === "USER" && (
            <Link to="/appointments" className={navLinkClass("/appointments")}>
              Appointments
            </Link>
          )}
          {token && (
            <Link to={getDashboardPath()} className={navLinkClass(getDashboardPath())}>
              Dashboard
            </Link>
          )}
          {token && role !== "ADMIN" && (
            <Link to="/profile" className={navLinkClass("/profile")}>
              Profile
            </Link>
          )}
          {!token && (
            <Link to="/login" className={navLinkClass("/login")}>
              Sign in
            </Link>
          )}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              title={`Signed in as ${user}`}
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
            >
              Get started
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Overview
          </Link>
          {role !== "PROVIDER" && (
            <Link
              to="/providers"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Providers
            </Link>
          )}
          {token ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              {role === "USER" && (
                <Link
                  to="/appointments"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Appointments
                </Link>
              )}
              {role !== "ADMIN" && (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 text-center"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
