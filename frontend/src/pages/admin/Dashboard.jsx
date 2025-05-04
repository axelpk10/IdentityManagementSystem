// src/pages/admin/Dashboard.jsx
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserManagement from "./UserManagement";
import RoleAssignment from "./RoleAssignment";
import SystemStats from "./SystemStats";
import ConfigPanel from "./ConfigPanel";

export default function AdminDashboard() {
  const { account } = useAuth();
  const navigate = useNavigate();

  // Navigate to different admin sections
  const navigateTo = (path) => {
    navigate(`/admin/${path}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Admin Dashboard
            </h1>
            <div className="border-l-4 border-blue-500 pl-4 py-2 mb-6">
              <p className="text-gray-600">
                Connected as: <span className="font-mono">{account}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">Role: Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">User Management</h2>
                <p className="text-gray-600">
                  View and manage users in the system.
                </p>
                <button
                  onClick={() => navigateTo("users")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Manage Users
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">Role Assignment</h2>
                <p className="text-gray-600">Assign and manage user roles.</p>
                <button
                  onClick={() => navigateTo("roles")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Assign Roles
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">
                  System Statistics
                </h2>
                <p className="text-gray-600">
                  View system-wide metrics and statistics.
                </p>
                <button
                  onClick={() => navigateTo("statistics")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  View Statistics
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">
                  Configuration Panel
                </h2>
                <p className="text-gray-600">
                  System-wide settings and configuration.
                </p>
                <button
                  onClick={() => navigateTo("config")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Manage Configuration
                </button>
              </div>
            </div>
          </div>
        }
      />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/roles" element={<RoleAssignment />} />
      <Route path="/statistics" element={<SystemStats />} />
      <Route path="/config" element={<ConfigPanel />} />
    </Routes>
  );
}
