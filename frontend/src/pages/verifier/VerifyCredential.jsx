import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMetadataFromIPFS,
  getIPFSGatewayUrl,
} from "../../services/ipfsService";
import Loading from "../../components/common/Loading";

export default function VerifyCredential() {
  const { contract, account } = useAuth();

  const [userAddress, setUserAddress] = useState("");
  const [credentials, setCredentials] = useState([]); // To hold the credentials
  const [credentialIndex, setCredentialIndex] = useState(null);
  const [credentialData, setCredentialData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);

  // Function to fetch all credentials of a user
  const fetchCredentials = async (userAddress) => {
    setLoading(true);
    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!userAddress) throw new Error("User address is required");

      const credentials = await contract.getCredentials(userAddress); // Assume there's a method to fetch all credentials
      setCredentials(credentials);
      setError(null);
    } catch (err) {
      console.error("Error fetching credentials:", err);
      setError("Failed to fetch credentials");
    } finally {
      setLoading(false);
    }
  };

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
      if (credentialIndex === null)
        throw new Error("Credential index is required");

      // Fetch credential data based on the selected index
      const credential = await contract.getCredential(
        userAddress,
        credentialIndex
      );
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

  useEffect(() => {
    if (userAddress) {
      fetchCredentials(userAddress);
    }
  }, [userAddress]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Verify Credential
      </h1>

      {/* User Address Input */}
      <div className="mb-4">
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
        />
      </div>

      {/* Display Loading */}
      {loading && <Loading />}

      {/* Display Errors */}
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

      {/* Select a Credential to Verify */}
      {credentials.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Credential
          </h2>
          <div className="mt-2">
            <select
              className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm"
              value={credentialIndex || ""}
              onChange={(e) => setCredentialIndex(Number(e.target.value))}
            >
              <option value="">Select a credential</option>
              {credentials.map((cred, index) => (
                <option key={index} value={index}>
                  {cred.title} (Issued by: {cred.issuer})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Verification Button */}
      {credentialIndex !== null && (
        <div>
          <button
            type="button"
            onClick={handleVerify}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
          >
            Verify Selected Credential
          </button>
        </div>
      )}

      {/* Display Verification Result */}
      {success && credentialData && (
        <div className="mt-6">
          {/* Verification Result */}
          <div
            className={`p-4 mb-4 ${
              verificationResult.isValid ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <h3 className="text-sm font-semibold text-gray-700">
              {verificationResult.isValid
                ? "Credential is valid"
                : "Credential is invalid"}
            </h3>
            {!verificationResult.isValid && (
              <div className="text-sm text-red-700">
                {verificationResult.isRevoked && (
                  <p>This credential has been revoked.</p>
                )}
                {verificationResult.isExpired && (
                  <p>This credential has expired.</p>
                )}
              </div>
            )}
          </div>
          {/* Credential Details */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Credential Details</h2>
            {/* Credential info... */}
          </div>
        </div>
      )}
    </div>
  );
}
