import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

import CreateCredential from "./CreateCredential";
import ManageCredential from "./ManageCredential";

export default function IssuerDashboard() {
  const { account, contract } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIssued: 0,
    activeCredentials: 0,
    revokedCredentials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load statistics when component mounts
    if (contract && account) {
      loadStats();
    }
  }, [contract, account]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Simulating async operation
      setTimeout(() => {
        setStats({
          totalIssued: 24,
          activeCredentials: 20,
          revokedCredentials: 4,
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error loading stats:", err);
      setLoading(false);
    }
  };

  // Navigate to create credential page
  const goToCreateCredential = () => {
    navigate("/issuer/create");
  };

  // Navigate to manage credentials page
  const goToManageCredentials = () => {
    navigate("/issuer/manage");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Issuer Dashboard
      </h1>
      <div className="border-l-4 border-green-500 pl-4 py-2 mb-6">
        <p className="text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-800">Total Issued</h3>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "..." : stats.totalIssued}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800">Active</h3>
          <p className="text-2xl font-bold text-blue-600">
            {loading ? "..." : stats.activeCredentials}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-800">Revoked</h3>
          <p className="text-2xl font-bold text-red-600">
            {loading ? "..." : stats.revokedCredentials}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Issue New Credential</h2>
          <p className="text-gray-600 mb-4">
            Create and issue new credentials to users with secure storage on
            IPFS.
          </p>
          <button
            onClick={goToCreateCredential}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Create Credential
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">
            Manage Issued Credentials
          </h2>
          <p className="text-gray-600 mb-4">
            View, update or revoke credentials you've previously issued.
          </p>
          <button
            onClick={goToManageCredentials}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            View Credentials
          </button>
        </div>
      </div>

      {/* Nested Routes for CreateCredential and ManageCredential */}
      <Routes>
        <Route path="/create" element={<CreateCredential />} />
        <Route path="/manage" element={<ManageCredential />} />
      </Routes>
    </div>
  );
}
