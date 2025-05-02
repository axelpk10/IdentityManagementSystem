import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { contract, userRole } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [issuersCount, setIssuersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // This would be expanded with real data in a production app
  // For now, we're using placeholder data

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUserCount(12);
      setIssuersCount(3);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-3xl font-bold text-blue-600">{userCount}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Issuers</h2>
              <p className="text-3xl font-bold text-green-600">
                {issuersCount}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Your Role</h2>
              <p className="text-xl font-semibold text-purple-600">
                {userRole}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  to="/admin/users"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-center"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/system"
                  className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-center"
                >
                  System Settings
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-3 py-1">
                  <p className="text-sm text-gray-600">10 minutes ago</p>
                  <p>New user registered</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="text-sm text-gray-600">2 hours ago</p>
                  <p>Role assigned to 0x1234...5678</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-1">
                  <p className="text-sm text-gray-600">1 day ago</p>
                  <p>System update completed</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
