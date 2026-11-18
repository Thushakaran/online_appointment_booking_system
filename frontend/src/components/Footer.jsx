import { Link } from "react-router-dom";
import { FiCalendar, FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-violet-600/20">
                <FiCalendar className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                Appoint<span className="text-violet-600">Flow</span>
              </span>
            </Link>
            <p className="mt-3.5 text-sm text-slate-500 leading-relaxed max-w-sm">
              Modern appointment scheduling for clients, service providers, and
              operations teams. Real-time availability without back-and-forth.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3.5">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-violet-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/providers"
                  className="hover:text-violet-700 transition-colors"
                >
                  Browse Providers
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="hover:text-violet-700 transition-colors"
                >
                  My Appointments
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-violet-700 transition-colors"
                >
                  Account Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3.5">
              Access
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/login"
                  className="hover:text-violet-700 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 hover:text-violet-700 transition-colors"
                >
                  <span>Create Account</span>
                  <FiArrowUpRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  to="/provider-dashboard"
                  className="hover:text-violet-700 transition-colors"
                >
                  Provider Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} AppointFlow. All rights reserved.
          </p>
          <p>Online Appointment Booking System</p>
        </div>
      </div>
    </footer>
  );
}
