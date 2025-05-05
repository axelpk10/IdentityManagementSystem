import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMetadataFromIPFS } from "../../services/ipfsService";
import Loading from "../../components/common/Loading";

export default function BulkVerification() {
  const { contract, account } = useAuth();

  const [requestData, setRequestData] = useState("");
  const [verificationResults, setVerificationResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Process input and prepare verification requests
  const parseVerificationRequests = (input) => {
    try {
      // Format expected: userAddress,credentialIndex (one per line)
      const lines = input.trim().split("\n");
      const requests = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [userAddress, credentialIndex] = line
            .split(",")
            .map((item) => item.trim());

          if (!userAddress || credentialIndex === undefined) {
            throw new Error(`Invalid format in line: ${line}`);
          }

          return {
            userAddress,
            credentialIndex: parseInt(credentialIndex),
          };
        });

      return requests;
    } catch (err) {
      throw new Error(`Failed to parse input: ${err.message}`);
    }
  };

  // Handle form submission for bulk verification
  const handleBulkVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setVerificationResults([]);

    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!requestData.trim()) throw new Error("Request data is required");

      const requests = parseVerificationRequests(requestData);
      const results = [];
      const now = Math.floor(Date.now() / 1000);

      // Process each verification request sequentially
      for (const request of requests) {
        try {
          const credential = await contract.getCredential(
            request.userAddress,
            request.credentialIndex
          );

          // Check if credential is valid
          const isExpired =
            credential.expiresAt > 0 && now > credential.expiresAt;

          const result = {
            userAddress: request.userAddress,
            credentialIndex: request.credentialIndex,
            title: credential.title,
            issuer: credential.issuer,
            result: {
              isValid: !credential.isRevoked && !isExpired,
              isRevoked: credential.isRevoked,
              isExpired: isExpired,
              verifiedAt: new Date().toISOString(),
            },
            timestamp: Date.now(),
            verifierAddress: account, // Store verifier address
          };

          results.push(result);

          // Add to verification history
          try {
            const storedHistory = JSON.parse(
              localStorage.getItem("verificationHistory") || "[]"
            );
            localStorage.setItem(
              "verificationHistory",
              JSON.stringify([result, ...storedHistory])
            );
          } catch (storageError) {
            console.error(
              "Failed to store verification history:",
              storageError
            );
          }
        } catch (requestError) {
          // Add failed verification to results
          results.push({
            userAddress: request.userAddress,
            credentialIndex: request.credentialIndex,
            title: "Unknown",
            issuer: "Unknown",
            result: {
              isValid: false,
              error: requestError.message,
              verifiedAt: new Date().toISOString(),
            },
            timestamp: Date.now(),
            verifierAddress: account,
          });
        }
      }

      setVerificationResults(results);
      setSuccess(true);
    } catch (err) {
      console.error("Bulk verification error:", err);
      setError(err.message || "Failed to perform bulk verification");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary of verification results
  const resultSummary = verificationResults.reduce(
    (summary, item) => {
      if (item.result.isValid) {
        summary.valid++;
      } else {
        summary.invalid++;
      }
      return summary;
    },
    { valid: 0, invalid: 0 }
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Bulk Verification
      </h1>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Enter multiple credential verification requests, one per line in the
          format:
          <code className="bg-gray-100 px-2 py-1 rounded ml-2">
            userAddress,credentialIndex
          </code>
        </p>

        <form onSubmit={handleBulkVerify}>
          <div className="mb-4">
            <label
              htmlFor="requestData"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification Requests
            </label>
            <textarea
              id="requestData"
              value={requestData}
              onChange={(e) => setRequestData(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 h-40 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x123...,0&#10;0x456...,1"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify All"}
            </button>
          </div>
        </form>
      </div>

      {loading && <Loading />}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && verificationResults.length > 0 && (
        <div className="mb-8">
          {/* Results Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold mb-2">Verification Results</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {verificationResults.length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded shadow">
                <h3 className="text-sm font-medium text-green-800">Valid</h3>
                <p className="text-2xl font-bold text-green-600">
                  {resultSummary.valid}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded shadow">
                <h3 className="text-sm font-medium text-red-800">Invalid</h3>
                <p className="text-2xl font-bold text-red-600">
                  {resultSummary.invalid}
                </p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {verificationResults.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        item.result.isValid ? "bg-green-50" : "bg-red-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.issuer}
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
                          <span className="px-2 py-1 mr-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-50 text-yellow-700">
                            Expired
                          </span>
                        )}
                        {item.result.error && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                            Error: {item.result.error.substring(0, 30)}
                            {item.result.error.length > 30 ? "..." : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
