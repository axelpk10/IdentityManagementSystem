import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading";

export default function VerificationHistory() {
  const { account } = useAuth();
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, valid, invalid

  useEffect(() => {
    loadVerificationHistory();
  }, [account]);

  const loadVerificationHistory = async () => {
    setLoading(true);
    try {
      // Load verification history from localStorage
      const storedHistory = JSON.parse(
        localStorage.getItem("verificationHistory") || "[]"
      );

      // Filter history to only include entries for the current account
      const filteredHistory = storedHistory.filter(
        (item) => item.verifierAddress === account
      );

      setVerificationHistory(filteredHistory);
    } catch (err) {
      console.error("Error loading verification history:", err);
      setError("Failed to load verification history");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    try {
      // Keep history entries from other verifiers
      const storedHistory = JSON.parse(
        localStorage.getItem("verificationHistory") || "[]"
      );
      const otherVerifiersHistory = storedHistory.filter(
        (item) => item.verifierAddress !== account
      );

      localStorage.setItem(
        "verificationHistory",
        JSON.stringify(otherVerifiersHistory)
      );

      setVerificationHistory([]);
    } catch (err) {
      console.error("Error clearing history:", err);
      setError("Failed to clear verification history");
    }
  };

  const filteredHistory = verificationHistory.filter((item) => {
    if (filter === "valid") return item.result.isValid;
    if (filter === "invalid") return !item.result.isValid;
    return true; // "all" filter
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Verification History
        </h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded py-1 px-2 text-sm"
          >
            <option value="all">All</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Invalid Only</option>
          </select>
          <button
            onClick={clearHistory}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No verification history found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credential
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Issued by: {item.issuer}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 font-mono truncate max-w-xs">
                      {item.userAddress}
                    </div>
                    <div className="text-sm text-gray-500">
                      Index: {item.credentialIndex}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.result.isValid ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Valid
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Invalid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.result.isRevoked && (
                      <span className="px-2 py-1 mr-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-50 text-red-700">
                        Revoked
                      </span>
                    )}
                    {item.result.isExpired && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-50 text-yellow-700">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
