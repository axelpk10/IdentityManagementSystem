import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isConnected, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/login" />;
  }

  // If no specific roles are required or user has the required role
  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return children;
  }

  // User doesn't have the required role
  return <Navigate to="/unauthorized" />;
}

export default ProtectedRoute;
