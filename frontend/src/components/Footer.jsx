import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <FiCalendar className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold text-slate-900">
                AppointFlow
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-xs">
              Modern appointment scheduling for clients, service providers, and
              operations teams. Real-time availability without back-and-forth.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/providers"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Browse Providers
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="hover:text-indigo-600 transition-colors"
                >
                  My Appointments
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Account Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Access
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/provider-dashboard"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Provider Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} AppointFlow. All rights reserved.
          </p>
          <p>Online Appointment Booking System</p>
        </div>
      </div>
    </footer>
  );
}
