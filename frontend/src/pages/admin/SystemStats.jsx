// src/pages/admin/SystemStats.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import Loading from "../../components/common/Loading";
import { Link } from "react-router-dom";

export default function SystemStats() {
  const { contract } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCredentials: 0,
    totalPublicCredentials: 0,
    usersByRole: {},
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // "all", "week", "month"

  useEffect(() => {
    if (contract) {
      loadStats();
    }
  }, [contract, timeRange]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get role assignment events
      const roleEvents = await contract.queryFilter(
        contract.filters.RoleAssigned()
      );

      // Get credential issued events
      const credentialEvents = await contract.queryFilter(
        contract.filters.CredentialIssued()
      );

      // Get credential revoked events
      const revokeEvents = await contract.queryFilter(
        contract.filters.CredentialRevoked()
      );

      // Process time range filter
      const currentTime = Math.floor(Date.now() / 1000);
      const filterByTime = (event) => {
        if (timeRange === "all") return true;

        const eventTime = event.args.timestamp || currentTime; // Fallback if no timestamp
        const weekSeconds = 7 * 24 * 60 * 60;
        const monthSeconds = 30 * 24 * 60 * 60;

        if (timeRange === "week") {
          return currentTime - eventTime <= weekSeconds;
        } else if (timeRange === "month") {
          return currentTime - eventTime <= monthSeconds;
        }
        return true;
      };

      // Get unique users and count by role
      const uniqueUsers = new Map();
      const roleCount = {};

      for (const event of roleEvents) {
        const userAddress = event.args.user;
        const role = event.args.role;

        uniqueUsers.set(userAddress, role);
        roleCount[role] = (roleCount[role] || 0) + 1;
      }

      // Calculate total credentials and public credentials
      let totalCredentials = credentialEvents.length;
      let totalPublicCredentials = 0;

      // Filter out revoked credentials
      const revokedIndices = new Set();
      for (const event of revokeEvents) {
        const userAddress = event.args.user;
        const index = event.args.index.toNumber();
        revokedIndices.add(`${userAddress}-${index}`);
        totalCredentials--;
      }

      // Recent activity (combine and sort events)
      const allEvents = [
        ...roleEvents.map((e) => ({
          type: "ROLE_ASSIGNED",
          address: e.args.user,
          role: e.args.role,
          blockNumber: e.blockNumber,
          transactionHash: e.transactionHash,
        })),
        ...credentialEvents.map((e) => ({
          type: "CREDENTIAL_ISSUED",
          address: e.args.to,
          title: e.args.title,
          issuer: e.args.issuer,
          blockNumber: e.blockNumber,
          transactionHash: e.transactionHash,
        })),
        ...revokeEvents.map((e) => ({
          type: "CREDENTIAL_REVOKED",
          address: e.args.user,
          index: e.args.index.toNumber(),
          blockNumber: e.blockNumber,
          transactionHash: e.transactionHash,
        })),
      ];

      // Sort by block number (descending)
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      // Take only last 10 events
      const recentActivity = allEvents.slice(0, 10);

      setStats({
        totalUsers: uniqueUsers.size,
        totalCredentials,
        totalPublicCredentials,
        usersByRole: roleCount,
        recentActivity,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Failed to load system statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Statistics</h1>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
          <Link
            to="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadStats}
                className="mt-2 text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-blue-800 text-sm font-medium mb-1">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-green-800 text-sm font-medium mb-1">
            Total Credentials
          </h3>
          <p className="text-3xl font-bold text-green-900">
            {stats.totalCredentials}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="text-yellow-800 text-sm font-medium mb-1">
            Public Credentials
          </h3>
          <p className="text-3xl font-bold text-yellow-900">
            {stats.totalPublicCredentials}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="text-purple-800 text-sm font-medium mb-1">
            Revoked Credentials
          </h3>
          <p className="text-3xl font-bold text-purple-900">
            {credentialEvents?.length - stats.totalCredentials || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Users by Role</h2>
          <div className="space-y-2">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium w-20 text-center ${
                    role === "admin"
                      ? "bg-blue-100 text-blue-800"
                      : role === "issuer"
                      ? "bg-green-100 text-green-800"
                      : role === "verifier"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {role}
                </span>
                <div className="ml-3 bg-gray-200 h-4 rounded-full flex-grow">
                  <div
                    className={`h-4 rounded-full ${
                      role === "admin"
                        ? "bg-blue-500"
                        : role === "issuer"
                        ? "bg-green-500"
                        : role === "verifier"
                        ? "bg-yellow-500"
                        : "bg-purple-500"
                    }`}
                    style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-500 italic">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="border-l-4 pl-3 py-1 text-sm border-gray-300"
                >
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.type === "ROLE_ASSIGNED"
                          ? "bg-blue-100 text-blue-800"
                          : activity.type === "CREDENTIAL_ISSUED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {activity.type.replace("_", " ")}
                    </span>
                    <span className="ml-auto text-gray-500 text-xs">
                      {/* This would show timestamp if available */}
                      Block #{activity.blockNumber}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs truncate">
                    {activity.address}
                  </p>
                  {activity.type === "CREDENTIAL_ISSUED" && (
                    <p className="mt-1 text-gray-700">
                      <span className="font-medium">{activity.title}</span> by{" "}
                      {activity.issuer}
                    </p>
                  )}
                  {activity.type === "ROLE_ASSIGNED" && (
                    <p className="mt-1 text-gray-700">
                      Role assigned:{" "}
                      <span className="font-medium">{activity.role}</span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
