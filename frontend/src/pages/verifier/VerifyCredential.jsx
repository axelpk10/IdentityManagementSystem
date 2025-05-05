import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMetadataFromIPFS,
  getIPFSGatewayUrl,
} from "../../services/ipfsService";
import Loading from "../../components/common/Loading";

export default function VerifyCredential() {
  const { contract, account } = useAuth();

  const [userAddress, setUserAddress] = useState("");
  const [credentialIndex, setCredentialIndex] = useState("");
  const [credentialData, setCredentialData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);

  // Function to request and verify a credential
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCredentialData(null);
    setMetadata(null);
    setVerificationResult(null);

    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!userAddress) throw new Error("User address is required");
      if (!credentialIndex && credentialIndex !== 0)
        throw new Error("Credential index is required");

      // Check if verifier has access to this credential
      const credential = await contract.getCredential(
        userAddress,
        credentialIndex
      );

      // Process and display the credential
      setCredentialData(credential);

      // Fetch metadata from IPFS if available
      if (credential.ipfsHash) {
        try {
          const metadataFromIPFS = await getMetadataFromIPFS(
            credential.ipfsHash
          );
          setMetadata(metadataFromIPFS);
        } catch (ipfsError) {
          console.error("Error fetching metadata:", ipfsError);
          // Non-critical error, we still have basic credential info
        }
      }

      // Check if credential is valid (not revoked and not expired)
      const now = Math.floor(Date.now() / 1000);
      const isExpired = credential.expiresAt > 0 && now > credential.expiresAt;

      const result = {
        isValid: !credential.isRevoked && !isExpired,
        isRevoked: credential.isRevoked,
        isExpired: isExpired,
        verifiedAt: new Date().toISOString(),
      };

      setVerificationResult(result);
      setSuccess(true);

      // Add to verification history (in a real app, this would be persisted)
      const historyItem = {
        userAddress,
        credentialIndex,
        title: credential.title,
        issuer: credential.issuer,
        result,
        timestamp: Date.now(),
      };

      setVerificationHistory((prev) => [historyItem, ...prev]);

      // Store in localStorage for persistence
      try {
        const storedHistory = JSON.parse(
          localStorage.getItem("verificationHistory") || "[]"
        );
        localStorage.setItem(
          "verificationHistory",
          JSON.stringify([historyItem, ...storedHistory])
        );
      } catch (storageError) {
        console.error("Failed to store verification history:", storageError);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify credential");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Verify Credential
      </h1>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="mb-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="userAddress"
              className="block text-sm font-medium text-gray-700"
            >
              User Address
            </label>
            <input
              type="text"
              id="userAddress"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="credentialIndex"
              className="block text-sm font-medium text-gray-700"
            >
              Credential Index
            </label>
            <input
              type="number"
              id="credentialIndex"
              value={credentialIndex}
              onChange={(e) => setCredentialIndex(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Credential"}
            </button>
          </div>
        </div>
      </form>

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

      {success && credentialData && (
        <div className="mb-6">
          {/* Verification Result Banner */}
          {verificationResult && (
            <div
              className={`mb-4 p-4 border-l-4 ${
                verificationResult.isValid
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {verificationResult.isValid ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
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
                  )}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm leading-5 font-medium ${
                      verificationResult.isValid
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {verificationResult.isValid
                      ? "Credential is valid"
                      : "Credential is invalid"}
                  </h3>
                  {!verificationResult.isValid && (
                    <div className="mt-1 text-sm leading-5 text-red-700">
                      {verificationResult.isRevoked && (
                        <p>This credential has been revoked.</p>
                      )}
                      {verificationResult.isExpired && (
                        <p>This credential has expired.</p>
                      )}
                    </div>
                  )}
                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Verified at:{" "}
                    {new Date(verificationResult.verifiedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credential Details */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Credential Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1 text-lg font-semibold">
                  {credentialData.title}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Issuer</h3>
                <p className="mt-1 text-lg">{credentialData.issuer}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Issued To</h3>
                <p className="mt-1 text-sm font-mono break-all">
                  {userAddress}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  {credentialData.isRevoked ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Issued At</h3>
                <p className="mt-1">
                  {new Date(
                    Number(credentialData.issuedAt) * 1000
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Expires At
                </h3>
                <p className="mt-1">
                  {credentialData.expiresAt &&
                  Number(credentialData.expiresAt) > 0
                    ? new Date(
                        Number(credentialData.expiresAt) * 1000
                      ).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            {/* IPFS Hash */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">IPFS Hash</h3>
              <p className="mt-1 font-mono text-sm break-all">
                {credentialData.ipfsHash}
              </p>
            </div>

            {/* Metadata Section */}
            {metadata && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-2">
                  Additional Metadata
                </h3>

                {metadata.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Description
                    </h4>
                    <p className="mt-1">{metadata.description}</p>
                  </div>
                )}

                {metadata.documentCid && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Document
                    </h4>
                    <div className="mt-2">
                      <a
                        href={getIPFSGatewayUrl(metadata.documentCid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          ></path>
                        </svg>
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Verifications */}
      {verificationHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Verifications</h2>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credential
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verificationHistory.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Issued by: {item.issuer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                        {new Date(item.timestamp).toLocaleString()}
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
