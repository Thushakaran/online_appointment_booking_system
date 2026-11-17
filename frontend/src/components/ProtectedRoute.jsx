import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

function getHomeByRole(role) {
  if (role === "ADMIN") return "/admin-dashboard";
  if (role === "PROVIDER") return "/provider-dashboard";
  return "/dashboard";
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return children;
}
