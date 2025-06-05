import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMetadataFromIPFS,
  getIPFSGatewayUrl,
  getFromIPFS,
} from "../../services/ipfsService";
import Loading from "../../components/common/Loading";

export default function VerifyCredential() {
  const { contract, account } = useAuth();

  const [userAddress, setUserAddress] = useState("");
  const [accessibleCredentials, setAccessibleCredentials] = useState([]);
  const [credentialIndices, setCredentialIndices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [credentialData, setCredentialData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  // New state variables for document viewing
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Load verification history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = JSON.parse(
        localStorage.getItem("verificationHistory") || "[]"
      );
      setVerificationHistory(storedHistory);
    } catch (error) {
      console.error("Failed to load verification history:", error);
    }
  }, []);

  // Function to fetch accessible credentials for the verifier
  const fetchAccessibleCredentials = async (address) => {
    setLoading(true);
    setError(null);
    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!address || !address.startsWith("0x"))
        throw new Error("Invalid address format");

      // Call the contract's new getAccessibleCredentials function
      const [indices, credentials] = await contract.getAccessibleCredentials(
        address
      );

      // Convert indices from BigNumber to regular numbers if needed
      const indexArray = indices.map((index) => Number(index));

      setCredentialIndices(indexArray);
      setAccessibleCredentials(credentials);

      if (credentials.length === 0) {
        setError("No accessible credentials found for this user");
      }
    } catch (err) {
      console.error("Error fetching credentials:", err);
      setError(err.message || "Failed to fetch credentials");
      setAccessibleCredentials([]);
      setCredentialIndices([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle address input changes
  const handleAddressChange = (e) => {
    setUserAddress(e.target.value);
    setSelectedIndex("");
    setCredentialData(null);
    setMetadata(null);
    setVerificationResult(null);
    setSuccess(false);
    setError(null);
    setDocumentUrl(null);
    setDocumentError(null);
  };

  // Function to search for user's credentials
  const handleSearch = (e) => {
    e.preventDefault();
    if (userAddress) {
      fetchAccessibleCredentials(userAddress);
    } else {
      setError("Please enter a user address");
    }
  };

  // Function to fetch and display credential details when selected
  const fetchCredentialDetails = async (index) => {
    setPreviewLoading(true);
    setDocumentError(null);
    setDocumentUrl(null);
    try {
      if (!contract) throw new Error("Contract not initialized");

      const credential = await contract.getCredential(userAddress, index);
      setCredentialData(credential);

      // Reset verification result when selecting a new credential
      setVerificationResult(null);
      setSuccess(false);

      // Fetch metadata from IPFS if available
      if (credential.ipfsHash) {
        try {
          const metadataFromIPFS = await getMetadataFromIPFS(
            credential.ipfsHash
          );
          setMetadata(metadataFromIPFS);

          // If we have the document CID, create a gateway URL
          if (metadataFromIPFS.documentCid) {
            const url = getIPFSGatewayUrl(metadataFromIPFS.documentCid);
            setDocumentUrl(url);
          }
        } catch (ipfsError) {
          console.error("Error fetching metadata:", ipfsError);
          setDocumentError("Failed to fetch document metadata from IPFS");
        }
      } else {
        setMetadata(null);
      }
    } catch (err) {
      console.error("Error fetching credential details:", err);
      setError(err.message || "Failed to fetch credential details");
      setCredentialData(null);
      setMetadata(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Function to handle credential selection
  const handleCredentialSelect = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);

    if (index) {
      // Fetch credential details as soon as it's selected
      fetchCredentialDetails(Number(index));
    } else {
      // Reset data if no credential is selected
      setCredentialData(null);
      setMetadata(null);
      setVerificationResult(null);
      setSuccess(false);
      setDocumentUrl(null);
      setDocumentError(null);
    }
  };

  // Function to verify a credential
  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!contract) throw new Error("Contract not initialized");
      if (!selectedIndex) throw new Error("Please select a credential");

      const index = Number(selectedIndex);

      // We already have the credential data, no need to fetch it again
      // Just call the contract's verifyCredential function
      const tx = await contract.verifyCredential(userAddress, index);
      await tx.wait();

      // Calculate verification result
      const now = Math.floor(Date.now() / 1000);
      const isExpired =
        credentialData.expiresAt > 0 && now > credentialData.expiresAt;

      const result = {
        isValid: !credentialData.isRevoked && !isExpired,
        isRevoked: credentialData.isRevoked,
        isExpired: isExpired,
        verifiedAt: new Date().toISOString(),
      };

      setVerificationResult(result);
      setSuccess(true);

      // Add to verification history
      const historyItem = {
        userAddress,
        credentialIndex: index,
        title: credentialData.title,
        issuer: credentialData.issuer,
        result,
        timestamp: Date.now(),
      };

      // Update state and localStorage
      const updatedHistory = [historyItem, ...verificationHistory];
      setVerificationHistory(updatedHistory);
      localStorage.setItem(
        "verificationHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify credential");
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp to human-readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp === 0) return "Never";

    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get file extension from URL or filename in metadata
  const getFileType = () => {
    if (!metadata || !metadata.documentCid) return null;

    // If the metadata contains original filename info
    if (metadata.fileName) {
      const extension = metadata.fileName.split(".").pop().toLowerCase();
      return extension;
    }

    return null;
  };

  // Render document viewer based on file type
  const renderDocumentViewer = () => {
    if (!documentUrl) {
      return null;
    }

    if (documentError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{documentError}</p>
        </div>
      );
    }

    const fileType = getFileType();

    // For PDF files
    if (fileType === "pdf") {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-96 border rounded"
          title="PDF Document"
        />
      );
    }

    // For images (PNG, JPG, JPEG, GIF)
    if (["png", "jpg", "jpeg", "gif"].includes(fileType)) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt="Credential Document"
            className="max-w-full max-h-96 object-contain"
          />
        </div>
      );
    }

    // For other file types or when type can't be determined
    return (
      <div className="mt-4">
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          View Document
        </a>
      </div>
    );
  };

  // Render credential details
  const renderCredentialDetails = () => {
    if (!credentialData) return null;

    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
        <h2 className="text-lg font-semibold mb-4">Credential Details</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Title:</span>
            <p className="mt-1">{credentialData.title}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Issuer:</span>
            <p className="mt-1">{credentialData.issuer}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">
              Issued On:
            </span>
            <p className="mt-1">{formatDate(credentialData.issuedAt)}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">
              Expires On:
            </span>
            <p className="mt-1">{formatDate(credentialData.expiresAt)}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">
              Visibility:
            </span>
            <p className="mt-1">
              {credentialData.isPublic ? "Public" : "Private"}
            </p>
          </div>

          {metadata && (
            <div className="pt-3 border-t border-gray-200 mt-3">
              <span className="text-sm font-medium text-gray-500">
                Additional Metadata:
              </span>
              <div className="mt-2 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                <pre className="text-xs">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Document Viewer Section */}
          {documentUrl && (
            <div className="pt-3 border-t border-gray-200 mt-3">
              <span className="text-sm font-medium text-gray-500 mb-2 block">
                Document:
              </span>
              <div className="mt-2 border rounded-md p-2">
                {renderDocumentViewer()}
              </div>
            </div>
          )}

          {credentialData.ipfsHash && !documentUrl && (
            <div>
              <span className="text-sm font-medium text-gray-500">
                IPFS Link:
              </span>
              <p className="mt-1">
                <a
                  href={getIPFSGatewayUrl(credentialData.ipfsHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Original Document
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Verify Credential
      </h1>

      {/* User Address Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="userAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User Address
            </label>
            <input
              type="text"
              id="userAddress"
              value={userAddress}
              onChange={handleAddressChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Display Loading */}
      {loading && <Loading />}

      {/* Preview Loading */}
      {previewLoading && (
        <div className="flex justify-center my-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading credential details...
            </p>
          </div>
        </div>
      )}

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
      {accessibleCredentials.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Select Credential
          </h2>
          <div className="mb-4">
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedIndex}
              onChange={handleCredentialSelect}
            >
              <option value="">Select a credential</option>
              {accessibleCredentials.map((cred, i) => (
                <option key={i} value={credentialIndices[i]}>
                  {cred.title} (Issued by: {cred.issuer})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Display Credential Details (before verification) */}
      {credentialData && !verificationResult && renderCredentialDetails()}

      {/* Verify Button (shown only when credential is selected and not yet verified) */}
      {selectedIndex && credentialData && !verificationResult && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleVerify}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Verify This Credential
          </button>
        </div>
      )}

      {/* Display Verification Result */}
      {success && verificationResult && (
        <div className="mt-6">
          {/* Verification Result Summary */}
          <div
            className={`p-4 mb-4 rounded-md ${
              verificationResult.isValid
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold ${
                verificationResult.isValid ? "text-green-700" : "text-red-700"
              }`}
            >
              {verificationResult.isValid
                ? "✓ Credential is valid"
                : "✗ Credential is invalid"}
            </h3>
            {!verificationResult.isValid && (
              <div className="mt-2 text-sm text-red-700">
                {verificationResult.isRevoked && (
                  <p>• This credential has been revoked by the issuer.</p>
                )}
                {verificationResult.isExpired && (
                  <p>• This credential has expired.</p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Verified on:{" "}
              {new Date(verificationResult.verifiedAt).toLocaleString()}
            </p>
          </div>

          {/* Display credential details again after verification */}
          {renderCredentialDetails()}
        </div>
      )}

      {/* Verification History */}
      {verificationHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Verifications
          </h2>
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verificationHistory.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.issuer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.userAddress.substring(0, 6)}...
                        {item.userAddress.substring(
                          item.userAddress.length - 4
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.result.isValid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.result.isValid ? "Valid" : "Invalid"}
                      </span>
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
      )}
    </div>
  );
}
