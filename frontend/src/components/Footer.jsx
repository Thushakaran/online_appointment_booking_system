import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[linear-gradient(to_right,#1e1e2f,#2a003f)] backdrop-blur-lg border-t border-gray-700 text-white mt-16 relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* About Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Appointment Booking</h3>
          <p className="text-gray-300">
            Seamlessly schedule appointments with providers you trust. Browse
            slots, manage your bookings, and stay organized.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {["/", "/providers", "/appointments", "/profile"].map(
              (path, index) => {
                const labels = ["Home", "Providers", "Appointments", "Profile"];
                return (
                  <li key={index}>
                    <Link
                      to={path}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300"
                    >
                      {labels[index]}
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
        </div>

        {/* Social / Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, i) => (
                <a
                  href="#"
                  key={i}
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300"
                >
                  <Icon size={20} />
                </a>
              )
            )}
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Appointment Booking. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
