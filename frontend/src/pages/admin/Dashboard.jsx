import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { account } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="border-l-4 border-blue-500 pl-4 py-2 mb-6">
        <p className="text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Role Management</h2>
          <p className="text-gray-600">
            Assign and manage user roles in the system.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Manage Roles
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">System Statistics</h2>
          <p className="text-gray-600">
            View system-wide statistics and metrics.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            View Statistics
          </button>
        </div>
      </div>
    </div>
  );
}
