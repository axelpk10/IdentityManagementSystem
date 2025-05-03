import { useAuth } from "../../context/AuthContext";

export default function IssuerDashboard() {
  const { account } = useAuth();

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Issue New Credential</h2>
          <p className="text-gray-600">
            Create and issue new credentials to users.
          </p>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            Create Credential
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            Manage Issued Credentials
          </h2>
          <p className="text-gray-600">
            View and manage credentials you've issued.
          </p>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            View Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
