import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

function UserManagement() {
  const { contract } = useAuth();
  const [userAddress, setUserAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [users, setUsers] = useState([]);

  // Placeholder users for UI demo
  useEffect(() => {
    const demoUsers = [
      { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", role: "issuer" },
      { address: "0xb794f5ea0ba39494ce839613fffba74279579268", role: "user" },
      { address: "0xe853c56864a2ebe4576a807d26fdc4a0ada51919", role: "user" },
    ];
    setUsers(demoUsers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ethers.utils.isAddress(userAddress)) {
      setMessage({ type: "error", content: "Invalid Ethereum address" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      // This would call your contract in production
      console.log(`Assigning role ${selectedRole} to ${userAddress}`);

      // Simulating contract call
      setTimeout(() => {
        // Add user to the list with the new role
        const newUser = { address: userAddress, role: selectedRole };
        const existingIndex = users.findIndex(
          (u) => u.address.toLowerCase() === userAddress.toLowerCase()
        );

        if (existingIndex >= 0) {
          // Update existing user
          const updatedUsers = [...users];
          updatedUsers[existingIndex].role = selectedRole;
          setUsers(updatedUsers);
        } else {
          // Add new user
          setUsers([...users, newUser]);
        }

        setMessage({
          type: "success",
          content: `Role assigned successfully to ${userAddress}`,
        });
        setUserAddress("");
        setSelectedRole("user");
        setIsLoading(false);
      }, 1000);

      // For production, you would use this:
      // await contract.assignRole(userAddress, selectedRole);
    } catch (error) {
      console.error("Error assigning role:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to assign role",
      });
      setIsLoading(false);
    }
  };

  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Assign Role</h2>

        {message.content && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="userAddress">
              User Address
            </label>
            <input
              id="userAddress"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="issuer">Issuer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Assign Role"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm">{user.address}</div>
                    <div className="text-sm text-gray-500">
                      {shortenAddress(user.address)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "issuer"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
