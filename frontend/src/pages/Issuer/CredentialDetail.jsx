// src/pages/Issuer/CredentialDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMetadataFromIPFS,
  getIPFSGatewayUrl,
} from "../../services/ipfsService";
import Loading from "../../components/common/Loading";

export default function CredentialDetail() {
  const { userAddress, index } = useParams();
  const { contract } = useAuth();
  const navigate = useNavigate();

  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeInProgress, setRevokeInProgress] = useState(false);

  useEffect(() => {
    if (contract && userAddress && index) {
      loadCredentialDetails();
    }
  }, [contract, userAddress, index]);

  const loadCredentialDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get credential from smart contract
      const credentialData = await contract.getCredential(userAddress, index);
      setCredential(credentialData);

      // Get metadata from IPFS
      if (credentialData.ipfsHash) {
        try {
          const metadataData = await getMetadataFromIPFS(
            credentialData.ipfsHash
          );
          setMetadata(metadataData);
        } catch (ipfsError) {
          console.error("Error fetching metadata from IPFS:", ipfsError);
          // We still have the basic credential info, so we don't throw
        }
      }
    } catch (err) {
      console.error("Error loading credential details:", err);
      setError(
        "Failed to load credential details. Please check if the credential exists."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this credential? This action cannot be undone."
      )
    ) {
      return;
    }

    setRevokeInProgress(true);
    try {
      const tx = await contract.revokeCredential(userAddress, index);
      await tx.wait();

      // Refresh the credential data to show updated status
      await loadCredentialDetails();

      alert("Credential revoked successfully!");
    } catch (err) {
      console.error("Error revoking credential:", err);
      setError("Failed to revoke credential: " + err.message);
    } finally {
      setRevokeInProgress(false);
    }
  };

  const goBack = () => {
    navigate("/issuer/manage");
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Credential Details
          </h1>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Back to Credentials
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Credential Details
          </h1>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Back to Credentials
          </button>
        </div>
        <div className="text-center py-10 text-gray-500">
          <p>No credential found with the specified parameters.</p>
        </div>
      </div>
    );
  }

  // Format timestamps
  const issuedDate = new Date(
    Number(credential.issuedAt) * 1000
  ).toLocaleString();
  const expiryDate =
    credential.expiresAt && Number(credential.expiresAt) > 0
      ? new Date(Number(credential.expiresAt) * 1000).toLocaleString()
      : "Never";

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Credential Details</h1>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Credentials
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        {credential.isRevoked ? (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Revoked
          </span>
        ) : (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        )}
      </div>

      {/* Main Details */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Credential Title
            </h3>
            <p className="mt-1 text-lg font-semibold">{credential.title}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Issuer</h3>
            <p className="mt-1 text-lg">{credential.issuer}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Recipient</h3>
            <p className="mt-1 text-sm font-mono">{userAddress}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Visibility</h3>
            <p className="mt-1">{credential.isPublic ? "Public" : "Private"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Issued Date</h3>
            <p className="mt-1">{issuedDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
            <p className="mt-1">{expiryDate}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">
              IPFS Hash (Metadata)
            </h3>
            <p className="mt-1 font-mono text-sm break-all">
              {credential.ipfsHash}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      {metadata && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.description && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1">{metadata.description}</p>
              </div>
            )}
            {metadata.documentCid && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Document</h3>
                <div className="mt-2">
                  <a
                    href={getIPFSGatewayUrl(metadata.documentCid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    View Document
                  </a>
                </div>
              </div>
            )}
            {metadata.createdAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created At
                </h3>
                <p className="mt-1">
                  {new Date(metadata.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {!credential.isRevoked && (
          <button
            onClick={handleRevoke}
            disabled={revokeInProgress}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {revokeInProgress ? "Revoking..." : "Revoke Credential"}
          </button>
        )}
      </div>
    </div>
  );
}
