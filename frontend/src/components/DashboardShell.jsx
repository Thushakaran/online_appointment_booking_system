import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  FiCalendar,
  FiGrid,
  FiUser,
  FiClock,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiChevronRight,
  FiBriefcase,
} from "react-icons/fi";

export default function DashboardShell({
  title,
  breadcrumb = "Workspace",
  actions = null,
  notifications = [],
  onSelectSection,
  activeSection,
  customNavItems = null,
  children,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, userId } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const readStorageKey = `appointflow:read-notifications:${role || "guest"}:${userId || "guest"}`;
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(readStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(readIds));
    } catch {
      // Notification state remains usable for this session if storage is unavailable.
    }
  }, [readStorageKey, readIds]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(readStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setReadIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadIds([]);
    }
  }, [readStorageKey]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const defaultNavByRole = () => {
    if (role === "ADMIN") {
      return [
        { to: "/admin-dashboard", label: "Overview", icon: FiGrid },
        { to: "/admin/providers", label: "Provider Directory", icon: FiBriefcase },
        { to: "/providers", label: "Public Directory", icon: FiSearch },
      ];
    }
    if (role === "PROVIDER") {
      return [
        { to: "/provider-dashboard", label: "Overview", icon: FiGrid },
        { to: "/provider-setup", label: "Service & Pricing", icon: FiSettings },
        { to: "/profile", label: "Account Profile", icon: FiUser },
      ];
    }
    return [
      { to: "/dashboard", label: "Overview", icon: FiGrid },
      { to: "/providers", label: "Browse Providers", icon: FiSearch },
      { to: "/appointments", label: "My Appointments", icon: FiCalendar },
      { to: "/profile", label: "Account Profile", icon: FiUser },
    ];
  };

  const navItems = customNavItems || defaultNavByRole();
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    setReadIds((current) => [...new Set([...current, ...notifications.map((n) => n.id)])]);
  };

  const toggleRead = (id) => {
    setReadIds((current) =>
      current.includes(id) ? current.filter((readId) => readId !== id) : [...current, id]
    );
  };

  const renderNavLink = (item) => {
    const Icon = item.icon || FiClock;
    if (item.sectionId && onSelectSection) {
      const active = activeSection === item.sectionId;
      return (
        <button
          key={item.sectionId}
          type="button"
          onClick={() => {
            onSelectSection(item.sectionId);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            active
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-600/25"
              : "text-slate-600 hover:bg-violet-50/60 hover:text-violet-900"
          }`}
        >
          <span className="flex items-center gap-3 whitespace-nowrap">
            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} aria-hidden="true" />
            <span>{item.label}</span>
          </span>
          {typeof item.count === "number" && (
            <span
              className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                active ? "bg-white/20 text-white" : "text-slate-500 bg-slate-100"
              }`}
            >
              {item.count}
            </span>
          )}
        </button>
      );
    }

    const active = location.pathname === item.to;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
          active
            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-600/25"
            : "text-slate-600 hover:bg-violet-50/60 hover:text-violet-900"
        }`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30 shadow-[1px_0_8px_rgba(15,23,42,0.02)]">
        <div className="h-16 px-5 flex items-center border-b border-slate-200/80">
          <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-600/25 group-hover:shadow-md transition-all">
              <FiCalendar className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              Appoint<span className="text-violet-600">Flow</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Workspace navigation">
          {navItems.map(renderNavLink)}
        </nav>

        <div className="p-4 border-t border-slate-200/80 space-y-3 bg-slate-50/40">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white border border-slate-200/70">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/70 flex items-center justify-center text-violet-700 font-bold text-xs shrink-0">
              {(user || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {role === "ADMIN"
                  ? "Administrator"
                  : role === "PROVIDER"
                  ? "Service Provider"
                  : "Client Account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-full bg-white border-r border-slate-200 flex flex-col z-10 shadow-2xl">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-violet-600/25">
                  <FiCalendar className="w-4 h-4" />
                </span>
                <span className="font-display text-lg font-bold text-slate-900">
                  Appoint<span className="text-violet-600">Flow</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navItems.map(renderNavLink)}
            </nav>
            <div className="p-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out ({user})</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 saas-ambient-canvas">
        {/* Contextual Top Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
              aria-label="Open navigation"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 hidden sm:inline whitespace-nowrap">
                {breadcrumb}
              </span>
              <FiChevronRight
                className="w-4 h-4 text-violet-400 hidden sm:inline shrink-0"
                aria-hidden="true"
              />
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {actions}

            {/* Real Appointment Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50/40 transition-all"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/10 z-40 overflow-hidden animate-modal-in">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-sm font-semibold text-slate-900">
                        Notifications
                      </span>
                      {notifications.length > 0 && unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No recent activity notifications.
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isUnread = !readIds.includes(n.id);
                          return (
                            <div
                              key={n.id}
                              className={`px-4 py-3 text-sm transition-colors ${
                                isUnread ? "bg-violet-50/45" : "bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900">
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {n.detail}
                                    {" · "}
                                    <span className={isUnread ? "font-semibold text-violet-600" : "text-slate-400"}>
                                      {isUnread ? "Unread" : "Read"}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleRead(n.id)}
                                  className="shrink-0 text-xs font-medium text-violet-600 hover:text-violet-700 whitespace-nowrap"
                                  aria-label={`${isUnread ? "Mark as read" : "Mark as unread"}: ${n.title}`}
                                >
                                  {isUnread ? "Mark read" : "Mark unread"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
