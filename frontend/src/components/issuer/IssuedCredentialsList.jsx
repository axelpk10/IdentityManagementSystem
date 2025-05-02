// src/components/issuer/IssuedCredentialsList.jsx
import React, { useState } from "react";
import CredentialCard from "../common/CredentialCard";

const IssuedCredentialsList = ({ credentials, onRevokeCredential }) => {
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'revoked'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  // Filter credentials based on current filters
  const filteredCredentials = credentials.filter((cred) => {
    // Filter by status
    if (filterStatus === "active" && cred.isRevoked) return false;
    if (filterStatus === "revoked" && !cred.isRevoked) return false;

    // Filter by search term (title or issuer)
    if (
      searchTerm &&
      !cred.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !cred.issuer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by owner address
    if (
      filterOwner &&
      !cred.owner.toLowerCase().includes(filterOwner.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleRevokeConfirmation = (userAddress, index) => {
    if (
      window.confirm(
        "Are you sure you want to revoke this credential? This action cannot be undone."
      )
    ) {
      onRevokeCredential(userAddress, index);
    }
  };

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by Title or Issuer
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Filter by Owner */}
          <div className="flex-grow">
            <label
              htmlFor="owner"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Owner Address
            </label>
            <input
              type="text"
              id="owner"
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of Credentials */}
      {filteredCredentials.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No credentials found matching your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCredentials.map((credential, index) => (
            <CredentialCard
              key={`${credential.owner}-${index}`}
              credential={credential}
              index={index}
              userAddress={credential.owner}
              onRevoke={handleRevokeConfirmation}
              issuerView={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuedCredentialsList;
