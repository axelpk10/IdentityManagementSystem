import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminNav() {
  const { currentAccount, disconnectWallet } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    disconnectWallet();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <span className="text-xl font-bold mr-8">Identity Management</span>

            <div className="hidden md:flex space-x-4">
              <Link
                to="/admin/dashboard"
                className={`py-2 px-3 rounded-md ${
                  isActive("/admin/dashboard")
                    ? "bg-gray-900"
                    : "hover:bg-gray-700"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/users"
                className={`py-2 px-3 rounded-md ${
                  isActive("/admin/users") ? "bg-gray-900" : "hover:bg-gray-700"
                }`}
              >
                User Management
              </Link>
              <Link
                to="/admin/system"
                className={`py-2 px-3 rounded-md ${
                  isActive("/admin/system")
                    ? "bg-gray-900"
                    : "hover:bg-gray-700"
                }`}
              >
                System Settings
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-gray-300 hover:text-white">
              <span className="hidden md:inline mr-2">Account:</span>
              <span className="font-mono">
                {currentAccount
                  ? `${currentAccount.substring(
                      0,
                      6
                    )}...${currentAccount.substring(currentAccount.length - 4)}`
                  : "-"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;
