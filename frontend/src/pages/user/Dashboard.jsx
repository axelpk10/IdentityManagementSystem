// src/pages/user/Dashboard.jsx
import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const { account } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Dashboard</h1>
      <div className="border-l-4 border-purple-500 pl-4 py-2 mb-6">
        <p className="text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">My Credentials</h2>
          <p className="text-gray-600">
            View and manage your digital credentials.
          </p>
          <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            View Credentials
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Privacy Settings</h2>
          <p className="text-gray-600">
            Manage who can access your credentials.
          </p>
          <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            Manage Privacy
          </button>
        </div>
      </div>
    </div>
  );
}
