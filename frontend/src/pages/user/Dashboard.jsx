// src/pages/user/Dashboard.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Credentials from "./Credentials";

export default function UserDashboard() {
  const { account } = useAuth();
  const navigate = useNavigate();

  // Navigate to credentials page
  const goToCredentials = () => {
    navigate("/user/credentials");
  };

  // Navigate to privacy settings
  const goToPrivacySettings = () => {
    navigate("/user/privacy");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              User Dashboard
            </h1>
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
                <button
                  onClick={goToCredentials}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  View Credentials
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Privacy Settings</h2>
                <p className="text-gray-600">
                  Manage who can access your credentials.
                </p>
                <button
                  onClick={goToPrivacySettings}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  Manage Privacy
                </button>
              </div>
            </div>
          </div>
        }
      />
      <Route path="/credentials" element={<Credentials />} />
      <Route
        path="/privacy"
        element={
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Privacy Settings
            </h1>
            <p>
              Privacy settings page coming soon. For now, you can manage privacy
              on individual credentials.
            </p>
            <div className="mt-4">
              <Link
                to="/user/credentials"
                className="text-purple-600 hover:text-purple-800"
              >
                Go to Credentials
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
