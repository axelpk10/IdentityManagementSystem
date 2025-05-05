// src/pages/Issuer/ManageCredentials.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading";
import { ethers } from "ethers";

export default function ManageCredentials() {
  const { contract } = useAuth();
  const navigate = useNavigate();

  const [issuedCredentials, setIssuedCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, revoked

  useEffect(() => {
    if (contract) {
      loadIssuedCredentials();
    }
  }, [contract]);

  const loadIssuedCredentials = async () => {
    setLoading(true);
    setError(null);

    try {
      // We'll listen to past CredentialIssued events to get all credentials issued by this account
      // In a production app, you might want to use a database or The Graph for better performance
      const issuerFilter = contract.filters.CredentialIssued();
      const events = await contract.queryFilter(issuerFilter);

      // Process the events into a more usable format
      const credentialsData = await Promise.all(
        events.map(async (event) => {
          const { to, title, issuer } = event.args;

          // Get the block for timestamp information
          const block = await event.getBlock();

          // Try to get additional credential details
          let credentialDetails = {};
          let isRevoked = false;

          try {
            // Get the index of this credential for the user
            // This is a simplification - in a real app, you'd need a more reliable way to get the index
            const allUserCredentials = await contract.getAllCredentials(to);
            const index = allUserCredentials.findIndex(
              (cred) => cred.title === title
            );

            if (index !== -1) {
              credentialDetails = allUserCredentials[index];
              isRevoked = credentialDetails.isRevoked;
            }
          } catch (err) {
            console.warn("Couldn't get credential details:", err);
          }

          return {
            userAddress: to,
            title,
            issuer,
            issuedAt: new Date(block.timestamp * 1000),
            isRevoked,
            ipfsHash: credentialDetails.ipfsHash || "",
            expiresAt: credentialDetails.expiresAt
              ? new Date(credentialDetails.expiresAt * 1000)
              : null,
            index: credentialDetails.index || 0, // This would be approximate
          };
        })
      );

      setIssuedCredentials(credentialsData);
    } catch (err) {
      console.error("Error loading issued credentials:", err);
      setError("Failed to load credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userAddress, index) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this credential? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const tx = await contract.revokeCredential(userAddress, index);
      await tx.wait();

      // Update the local state
      setIssuedCredentials((prev) =>
        prev.map((cred) =>
          cred.userAddress === userAddress && cred.index === index
            ? { ...cred, isRevoked: true }
            : cred
        )
      );

      alert("Credential revoked successfully!");
    } catch (err) {
      console.error("Error revoking credential:", err);
      alert("Failed to revoke credential: " + err.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredCredentials = issuedCredentials.filter((cred) => {
    // Apply search filter
    const searchMatches =
      cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.userAddress.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    let statusMatches = true;
    if (filterStatus === "active") statusMatches = !cred.isRevoked;
    if (filterStatus === "revoked") statusMatches = cred.isRevoked;

    return searchMatches && statusMatches;
  });

  const viewCredentialDetails = (userAddress, index) => {
    navigate(`/issuer/credential/${userAddress}/${index}`);
  };

  const goBack = () => {
    navigate("/issuer");
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Credentials</h1>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

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

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by title or address..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="w-full md:w-1/4">
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>

        <button
          onClick={loadIssuedCredentials}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {filteredCredentials.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {issuedCredentials.length === 0 ? (
            <p>No credentials have been issued yet.</p>
          ) : (
            <p>No credentials match your filters.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCredentials.map((credential, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {credential.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {`${credential.userAddress.slice(
                      0,
                      6
                    )}...${credential.userAddress.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credential.issuedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {credential.isRevoked ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        viewCredentialDetails(
                          credential.userAddress,
                          credential.index
                        )
                      }
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    {!credential.isRevoked && (
                      <button
                        onClick={() =>
                          handleRevoke(credential.userAddress, credential.index)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
