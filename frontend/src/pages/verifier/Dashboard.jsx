import { useAuth } from "../../context/AuthContext";

export default function VerifierDashboard() {
  const { account } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Verifier Dashboard
      </h1>
      <div className="border-l-4 border-yellow-500 pl-4 py-2 mb-6">
        <p className="text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Verify Credentials</h2>
          <p className="text-gray-600">Request and verify user credentials.</p>
          <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
            Verify Credential
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Verification History</h2>
          <p className="text-gray-600">
            View your credential verification history.
          </p>
          <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
