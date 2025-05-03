import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./common/Loading";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { account, role, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Not authenticated
  if (!account) {
    return <Navigate to="/" />;
  }

  // Admin has access to everything
  if (isAdmin) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Authenticated and authorized
  return children;
}
