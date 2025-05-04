// src/pages/admin/RoleAssignment.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import Loading from "../../components/common/Loading";
import { Link, useLocation } from "react-router-dom";

export default function RoleAssignment() {
  const { contract } = useAuth();
  const location = useLocation();
  const [address, setAddress] = useState(location.state?.address || "");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [roleHistory, setRoleHistory] = useState([]);

  // Available roles
  const roles = ["user", "issuer", "verifier"];

  useEffect(() => {
    if (contract && address) {
      checkCurrentRole();
      loadRoleHistory();
    }
  }, [contract, address]);

  const checkCurrentRole = async () => {
    if (!ethers.utils.isAddress(address)) return;

    setLoading(true);
    try {
      const role = await contract.userRoles(address);
      setCurrentRole(role || "");
      setRole(role || "user"); // Default selection
    } catch (err) {
      console.error("Error checking role:", err);
      setMessage({
        type: "error",
        text: "Failed to check current role. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoleHistory = async () => {
    if (!ethers.utils.isAddress(address)) return;

    try {
      // Get role assignment events for this address
      const roleEvents = await contract.queryFilter(
        contract.filters.RoleAssigned(address)
      );

      // Format events for display
      const history = await Promise.all(
        roleEvents.map(async (event) => {
          const block = await event.getBlock();
          return {
            role: event.args.role,
            timestamp: new Date(block.timestamp * 1000).toLocaleString(),
            txHash: event.transactionHash,
          };
        })
      );

      setRoleHistory(history.reverse()); // Show newest first
    } catch (err) {
      console.error("Error loading role history:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !role) {
      setMessage({
        type: "error",
        text: "Please provide both address and role",
      });
      return;
    }

    if (!ethers.utils.isAddress(address)) {
      setMessage({ type: "error", text: "Invalid Ethereum address" });
      return;
    }

    setTxPending(true);
    setMessage({ type: "", text: "" });

    try {
      // Call contract to assign role
      const tx = await contract.assignRole(address, role);
      setMessage({
        type: "info",
        text: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction confirmation
      await tx.wait();

      setMessage({
        type: "success",
        text: `Role "${role}" has been assigned to the address successfully!`,
      });

      // Update current role and history
      setCurrentRole(role);
      loadRoleHistory();
    } catch (err) {
      console.error("Error assigning role:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to assign role. Please try again.",
      });
    } finally {
      setTxPending(false);
    }
  };

  const clearForm = () => {
    setAddress("");
    setRole("");
    setCurrentRole("");
    setRoleHistory([]);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Assignment</h1>
        <Link
          to="/admin"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "error"
              ? "bg-red-50 text-red-800 border-l-4 border-red-500"
              : message.type === "success"
              ? "bg-green-50 text-green-800 border-l-4 border-green-500"
              : "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ethereum Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={txPending}
              />
              {address && !ethers.utils.isAddress(address) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid Ethereum address
                </p>
              )}
            </div>

            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {currentRole && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Current Role:</p>
                    <p className="font-medium">{currentRole || "None"}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={txPending}
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      txPending ||
                      !address ||
                      !role ||
                      !ethers.utils.isAddress(address)
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
                  >
                    {txPending ? "Processing..." : "Assign Role"}
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={txPending}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">
            Role Assignment History
          </h2>
          {roleHistory.length === 0 ? (
            <p className="text-gray-500 italic">
              {address
                ? "No role history found for this address"
                : "Enter an address to view role history"}
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roleHistory.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : item.role === "issuer"
                              ? "bg-green-100 text-green-800"
                              : item.role === "verifier"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {item.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
