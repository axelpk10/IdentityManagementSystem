// src/components/user/CredentialDetail.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../common/Loading";
import VerifierControl from "./VerifierControl";
import {
  getMetadataFromIPFS,
  getFromIPFS,
  getIPFSGatewayUrl,
} from "../../services/ipfsService";

export default function CredentialDetail({
  credential,
  index,
  onClose,
  onPrivacyUpdated,
}) {
  const { contract, account } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(true);

  // Load document metadata and URL when component mounts
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoadingDocument(true);

        // Get the metadata from IPFS
        const metadata = await getMetadataFromIPFS(credential.ipfsHash);
        setDocumentMetadata(metadata);

        // If we have the document CID, create a gateway URL
        if (metadata.documentCid) {
          const url = getIPFSGatewayUrl(metadata.documentCid);
          setDocumentUrl(url);
        } else {
          setError("Document not found in metadata");
        }
      } catch (err) {
        console.error("Error loading document:", err);
        setError("Failed to load document from IPFS");
      } finally {
        setLoadingDocument(false);
      }
    };

    if (credential.ipfsHash) {
      fetchDocumentData();
    }
  }, [credential.ipfsHash]);

  // Convert timestamp to date string
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Determine status
  const getStatus = () => {
    if (credential.isRevoked) return "Revoked";
    if (credential.expiresAt && Date.now() / 1000 > credential.expiresAt)
      return "Expired";
    return "Valid";
  };

  // Get status color class
  const getStatusColor = () => {
    if (credential.isRevoked) return "text-red-600";
    if (credential.expiresAt && Date.now() / 1000 > credential.expiresAt)
      return "text-gray-600";
    return "text-green-600";
  };

  // Get file extension from URL or filename
  const getFileType = () => {
    if (!documentMetadata || !documentMetadata.documentCid) return null;

    // If the metadata contains original filename info
    if (documentMetadata.fileName) {
      const extension = documentMetadata.fileName
        .split(".")
        .pop()
        .toLowerCase();
      return extension;
    }

    return null;
  };

  // Toggle credential privacy setting
  const togglePrivacy = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the contract's updateCredentialPrivacy function
      const newPrivacyStatus = !credential.isPublic;
      const tx = await contract.updateCredentialPrivacy(
        account,
        index,
        newPrivacyStatus
      );

      // Wait for transaction to be mined
      await tx.wait();

      setIsLoading(false);

      // Call the parent handler to refresh credentials
      if (onPrivacyUpdated) {
        onPrivacyUpdated();
      }
    } catch (err) {
      console.error("Error updating privacy:", err);
      setError("Failed to update privacy settings. Please try again.");
      setIsLoading(false);
    }
  };

  // Render document viewer based on file type
  const renderDocumentViewer = () => {
    if (loadingDocument) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      );
    }

    if (!documentUrl) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">Document URL not available</p>
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">{credential.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {error && !loadingDocument && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Issuer</h3>
              <p className="mt-1">{credential.issuer}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={`mt-1 ${getStatusColor()} font-medium`}>
                {getStatus()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Issued Date</h3>
              <p className="mt-1">{formatDate(credential.issuedAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Expiration Date
              </h3>
              <p className="mt-1">{formatDate(credential.expiresAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Visibility</h3>
              <p className="mt-1">
                {credential.isPublic ? "Public" : "Private"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Metadata Hash
              </h3>
              <p className="mt-1 font-mono text-sm break-all">
                <a
                  href={`http://localhost:8080/ipfs/${credential.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800"
                >
                  {credential.ipfsHash.substring(0, 15)}...
                </a>
              </p>
            </div>
          </div>

          {/* Document Display Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Document</h3>
            <div className="border rounded-md p-2">
              {renderDocumentViewer()}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Authorized Verifiers
            </h3>
            {credential.allowedVerifiers.length === 0 ? (
              <p className="text-gray-600 italic">No verifiers authorized</p>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-auto">
                <ul className="space-y-1">
                  {credential.allowedVerifiers.map((address, i) => (
                    <li key={i} className="font-mono text-sm">
                      {address}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={isLoading}
            >
              Manage Verifier Access
            </button>
            <button
              onClick={togglePrivacy}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : credential.isPublic ? (
                "Make Private"
              ) : (
                "Make Public"
              )}
            </button>
          </div>
        </div>
      </div>

      {isPrivacyModalOpen && (
        <VerifierControl
          credential={credential}
          index={index}
          onClose={() => setIsPrivacyModalOpen(false)}
          onUpdate={onPrivacyUpdated}
        />
      )}
    </div>
  );
}
