import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../api/axios";
import dayjs from "dayjs";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FiHome,
  FiCalendar,
  FiSearch,
  FiUser,
  FiSettings,
  FiUsers,
  FiBriefcase,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
  FiPlus,
  FiChevronRight,
} from "react-icons/fi";

export default function AppShell({
  children,
  title,
  breadcrumb,
  primaryAction,
  forcePublicShell = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, user, userId } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Close notification popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real appointment notifications for authenticated USER or PROVIDER
  useEffect(() => {
    if (!token || forcePublicShell) return;
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        if (role === "USER" && userId) {
          const res = await api.get(`/api/appointments/user/${userId}`);
          if (!cancelled && Array.isArray(res.data)) {
            const active = res.data
              .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
              .slice(0, 5)
              .map((a) => ({
                id: a.id,
                title:
                  a.status === "PENDING"
                    ? `Pending confirmation: ${a.provider?.serviceName || "Appointment"}`
                    : `Confirmed: ${a.provider?.serviceName || "Appointment"}`,
                time: a.appointmentDate
                  ? dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A")
                  : "Scheduled",
                link: "/appointments",
              }));
            setNotifications(active);
          }
        } else if (role === "PROVIDER") {
          const res = await api.get("/api/appointments/my-appointments");
          if (!cancelled && Array.isArray(res.data)) {
            const pending = res.data
              .filter((a) => a.status === "PENDING")
              .slice(0, 5)
              .map((a) => ({
                id: a.id,
                title: `New request from ${a.user?.username || "Client"}`,
                time: a.appointmentDate
                  ? dayjs(a.appointmentDate).format("MMM D, YYYY · h:mm A")
                  : "Scheduled",
                link: "/provider-dashboard",
              }));
            setNotifications(pending);
          }
        }
      } catch {
        // Silently ignore if profile is not yet created
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [token, role, userId, location.pathname, forcePublicShell]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Use clean public top-bar layout for unauthenticated users or explicitly public pages
  if (!token || forcePublicShell) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Role-based sidebar navigation
  const getNavItems = () => {
    if (role === "ADMIN") {
      return [
        { to: "/admin-dashboard", label: "Admin Console", Icon: FiHome },
        { to: "/admin/providers", label: "Provider Onboarding", Icon: FiBriefcase },
        { to: "/providers", label: "Public Directory", Icon: FiSearch },
      ];
    }
    if (role === "PROVIDER") {
      return [
        { to: "/provider-dashboard", label: "Dashboard", Icon: FiHome },
        { to: "/provider-setup", label: "Business Profile", Icon: FiSettings },
        { to: "/profile", label: "Account Settings", Icon: FiUser },
      ];
    }
    // Default: USER
    return [
      { to: "/dashboard", label: "Dashboard", Icon: FiHome },
      { to: "/providers", label: "Browse Providers", Icon: FiSearch },
      { to: "/appointments", label: "My Appointments", Icon: FiCalendar },
      { to: "/profile", label: "Profile & Security", Icon: FiUser },
    ];
  };

  const navItems = getNavItems();

  const defaultPrimaryAction =
    role === "USER"
      ? { label: "Book Appointment", to: "/providers", Icon: FiPlus }
      : role === "PROVIDER"
      ? { label: "Edit Business Profile", to: "/provider-setup", Icon: FiSettings }
      : { label: "Add Provider", to: "/admin/providers", Icon: FiPlus };

  const action = primaryAction || defaultPrimaryAction;

  const isRouteActive = (path) => {
    if (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) {
      return true;
    }
    return location.pathname === path;
  };

  const roleLabel =
    role === "ADMIN" ? "Administrator" : role === "PROVIDER" ? "Service Provider" : "Client Account";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
        <Link
          to={
            role === "ADMIN"
              ? "/admin-dashboard"
              : role === "PROVIDER"
              ? "/provider-dashboard"
              : "/dashboard"
          }
          onClick={() => setSidebarOpen(false)}
          className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          AppointFlow
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Workspace navigation">
        <div className="px-3 pb-2 text-xs font-medium text-slate-400">
          {roleLabel}
        </div>
        {navItems.map((item) => {
          const active = isRouteActive(item.to);
          const Icon = item.Icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Account Footer */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-display font-semibold text-sm flex items-center justify-center shrink-0">
            {(user || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{user}</div>
            <div className="text-xs text-slate-500 truncate">{roleLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <FiLogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 whitespace-nowrap">
                Workspace
              </span>
              <FiChevronRight className="hidden sm:inline w-4 h-4 text-slate-300 shrink-0" />
              <span className="font-display font-semibold text-slate-900 truncate">
                {breadcrumb || title || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Real appointment notifications (only for USER and PROVIDER who have active items) */}
            {(role === "USER" || role === "PROVIDER") && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <FiBell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="sr-only">{notifications.length} active notifications</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        Appointment Updates
                      </span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {notifications.length}
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        No upcoming or pending updates.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.link}
                            onClick={() => setNotifOpen(false)}
                            className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="text-sm font-medium text-slate-800 truncate">
                              {n.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                              {n.time}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {action && (
              action.onClick ? (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {action.Icon && <action.Icon className="w-4 h-4" aria-hidden="true" />}
                  <span>{action.label}</span>
                </button>
              ) : (
                <Link
                  to={action.to}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {action.Icon && <action.Icon className="w-4 h-4" aria-hidden="true" />}
                  <span>{action.label}</span>
                </Link>
              )
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
