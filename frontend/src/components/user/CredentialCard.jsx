// src/components/user/CredentialCard.jsx
import { useState } from "react";

export default function CredentialCard({ credential, index, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Convert timestamp to date string
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return date.toLocaleDateString();
  };

  // Determine status badge color
  const getBadgeColor = () => {
    if (credential.isRevoked) return "bg-red-100 text-red-800";
    if (credential.expiresAt && Date.now() / 1000 > credential.expiresAt)
      return "bg-gray-100 text-gray-800";
    return "bg-green-100 text-green-800";
  };

  // Determine status text
  const getStatusText = () => {
    if (credential.isRevoked) return "Revoked";
    if (credential.expiresAt && Date.now() / 1000 > credential.expiresAt)
      return "Expired";
    return "Valid";
  };

  // Determine privacy badge
  const getPrivacyBadge = () => {
    return credential.isPublic ? (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        Public
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
        Private
      </span>
    );
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-shadow ${
        isHovered ? "shadow-md" : "shadow"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{credential.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          Issued by: {credential.issuer}
        </p>
        <div className="text-xs text-gray-500 mb-2">
          <div>Issued: {formatDate(credential.issuedAt)}</div>
          <div>Expires: {formatDate(credential.expiresAt)}</div>
        </div>
        <div className="flex justify-between items-center mt-2">
          {getPrivacyBadge()}
          <div className="text-xs text-purple-600">
            {credential.allowedVerifiers.length} verifier(s)
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-2 text-center text-sm text-gray-600 hover:bg-gray-100">
        Click to view details
      </div>
    </div>
  );
}
