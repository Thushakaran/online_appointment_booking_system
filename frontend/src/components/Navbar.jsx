import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
} from "react-icons/fi";

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

  const navLinks = [];
  navLinks.push({ to: "/", label: "Home" });

  if (role !== "PROVIDER") {
    navLinks.push({ to: "/providers", label: "Providers" });
  }

  if (token) {
    if (role === "USER") {
      navLinks.push({ to: "/dashboard", label: "Overview" });
      navLinks.push({ to: "/appointments", label: "Appointments" });
      navLinks.push({ to: "/profile", label: "Profile" });
    } else if (role === "PROVIDER") {
      navLinks.push({ to: "/provider-dashboard", label: "Dashboard" });
      navLinks.push({ to: "/provider-setup", label: "Service Setup" });
      navLinks.push({ to: "/profile", label: "Profile" });
    } else if (role === "ADMIN") {
      navLinks.push({ to: "/admin-dashboard", label: "Admin Console" });
      navLinks.push({ to: "/admin/providers", label: "Providers" });
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-600/25 group-hover:shadow-md group-hover:shadow-violet-600/30 transition-all">
            <FiCalendar className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Appoint<span className="text-violet-600">Flow</span>
          </span>
        </Link>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1.5"
        >
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 ${
                  active
                    ? "text-violet-700 bg-violet-50/90 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {token ? (
            <>
              <Link
                to={role === "ADMIN" ? getDashboardPath() : "/profile"}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-50/80 border border-slate-200/80 hover:border-violet-200 hover:bg-violet-50/40 transition-all whitespace-nowrap shrink-0"
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {(user || "U").slice(0, 2).toUpperCase()}
                </span>
                <span className="max-w-[130px] truncate">{user}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="saas-btn-secondary px-3.5 py-2 text-sm whitespace-nowrap shrink-0"
              >
                <FiLogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-violet-700 hover:bg-violet-50/50 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="saas-btn-primary px-4 py-2 text-sm whitespace-nowrap shrink-0"
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
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-1.5 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-slate-200/80 flex flex-col gap-2">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out ({user})</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="saas-btn-secondary w-full py-2.5 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="saas-btn-primary w-full py-2.5 text-sm"
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
