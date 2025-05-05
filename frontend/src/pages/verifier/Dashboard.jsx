import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

import VerifyCredential from "./VerifyCredential";
import VerificationHistory from "./VerificationHistory";
import BulkVerification from "./BulkVerification";

export default function VerifierDashboard() {
  const { account, contract } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVerifications: 0,
    validCredentials: 0,
    invalidCredentials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract && account) {
      loadStats();
    }
  }, [contract, account]);

  const loadStats = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setStats({
          totalVerifications: 15,
          validCredentials: 12,
          invalidCredentials: 3,
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error loading stats:", err);
      setLoading(false);
    }
  };

  const goToVerifyCredential = () => {
    navigate("/verifier/verify");
  };

  const goToVerificationHistory = () => {
    navigate("/verifier/history");
  };

  const goToBulkVerification = () => {
    navigate("/verifier/bulk");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Verifier Dashboard
      </h1>
      <div className="border-l-4 border-blue-500 pl-4 py-2 mb-6">
        <p className="text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-800">
            Total Verifications
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {loading ? "..." : stats.totalVerifications}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-800">Valid</h3>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "..." : stats.validCredentials}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-800">Invalid</h3>
          <p className="text-2xl font-bold text-red-600">
            {loading ? "..." : stats.invalidCredentials}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Verify Credential</h2>
          <p className="text-gray-600 mb-4">
            Request and verify individual credentials from users.
          </p>
          <button
            onClick={goToVerifyCredential}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Verify Credential
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Verification History</h2>
          <p className="text-gray-600 mb-4">
            View logs of your past credential verifications.
          </p>
          <button
            onClick={goToVerificationHistory}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View History
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Bulk Verification</h2>
          <p className="text-gray-600 mb-4">
            Verify multiple credentials at once for efficiency.
          </p>
          <button
            onClick={goToBulkVerification}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Bulk Verify
          </button>
        </div>
      </div>

      {/* Nested Routes for Verification Pages */}
      <Routes>
        <Route path="/verify" element={<VerifyCredential />} />
        <Route path="/history" element={<VerificationHistory />} />
        <Route path="/bulk" element={<BulkVerification />} />
      </Routes>
    </div>
  );
}
