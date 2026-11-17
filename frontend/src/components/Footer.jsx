import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link
              to="/"
              className="text-base font-display font-bold tracking-tight text-slate-900"
            >
              AppointFlow
            </Link>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Streamlined appointment scheduling for service providers, clients, and operations teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Overview
            </Link>
            <Link to="/providers" className="hover:text-slate-900 transition-colors">
              Providers
            </Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors">
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} AppointFlow. All rights reserved.</p>
          <p>Online Appointment Booking Platform</p>
        </div>
      </div>
    </footer>
  );
}
