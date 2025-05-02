import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function IssuerDashboard() {
  const { contract, currentAccount } = useAuth();
  const [issuedCount, setIssuedCount] = useState(0);
  const [recentCredentials, setRecentCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);

        // We'll use contract events to get credentials issued by this issuer
        const filter = contract.filters.CredentialIssued(null, null, null);
        const events = await contract.queryFilter(filter);

        // Filter events where this issuer is the issuer
        const myIssuedEvents = events.filter((event) => {
          return (
            event.args.issuer &&
            event.args.issuer.toLowerCase() === currentAccount.toLowerCase()
          );
        });

        setIssuedCount(myIssuedEvents.length);

        // Process recent credentials
        const recent = myIssuedEvents
          .slice(-5) // Get last 5 credentials
          .map((event) => ({
            title: event.args.title,
            recipient: event.args.to,
            timestamp: new Date(event.args.timestamp * 1000).toLocaleString(),
            transactionHash: event.transactionHash,
          }));

        setRecentCredentials(recent);
      } catch (err) {
        console.error("Error fetching issued credentials:", err);
        setError("Failed to load credential data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredentials();
  }, [contract, currentAccount]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Issuer Dashboard</h1>
        <Link
          to="/issuer/issue-credential"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Issue New Credential
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Credentials Summary</h2>
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Issued</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  issuedCount
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/issuer/issue-credential"
              className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded border border-gray-200 hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">New Credential</span>
            </Link>

            <Link
              to="/issuer/manage-credentials"
              className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded border border-gray-200 hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm">Manage Credentials</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Recently Issued Credentials</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentCredentials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Recipient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCredentials.map((credential, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {credential.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {credential.recipient.substring(0, 6)}...
                        {credential.recipient.substring(
                          credential.recipient.length - 4
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {credential.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={`https://etherscan.io/tx/${credential.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View Transaction
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No credentials have been issued yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default IssuerDashboard;
