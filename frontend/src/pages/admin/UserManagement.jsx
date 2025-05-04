// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import Loading from "../../components/common/Loading";
import { Link } from "react-router-dom";

export default function UserManagement() {
  const { contract } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (contract) {
      loadUsers();
    }
  }, [contract]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get past events for role assignments
      const roleAssignedEvents = await contract.queryFilter(
        contract.filters.RoleAssigned()
      );

      // Extract unique users from events
      const uniqueUsers = new Map();
      for (const event of roleAssignedEvents) {
        const userAddress = event.args.user;
        const role = event.args.role;

        // Add user to our map (overwriting if already exists to get latest role)
        uniqueUsers.set(userAddress, {
          address: userAddress,
          role: role,
          addedAt: new Date(event.blockNumber * 1000), // Approximate timestamp
        });
      }

      // Convert map to array and set state
      setUsers(Array.from(uniqueUsers.values()));
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Link
          to="/admin"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by address or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-grow"
          />
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadUsers}
                className="mt-2 text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-700">Address</th>
              <th className="py-2 px-4 text-left text-gray-700">Role</th>
              <th className="py-2 px-4 text-left text-gray-700">Added</th>
              <th className="py-2 px-4 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  {searchTerm ? "No users match your search" : "No users found"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-sm">
                    {user.address.slice(0, 8)}...{user.address.slice(-6)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "issuer"
                          ? "bg-green-100 text-green-800"
                          : user.role === "verifier"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {user.addedAt.toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      View
                    </button>
                    <Link
                      to="/admin/roles"
                      state={{ address: user.address }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit Role
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button
                onClick={closeUserDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-mono break-all">{selectedUser.address}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold">{selectedUser.role}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Added On</p>
              <p>{selectedUser.addedAt.toLocaleString()}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Link
                to="/admin/roles"
                state={{ address: selectedUser.address }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
              >
                Edit Role
              </Link>
              <button
                onClick={closeUserDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
