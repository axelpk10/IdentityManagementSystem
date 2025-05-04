// src/pages/user/Credentials.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading";
import CredentialCard from "../../components/user/CredentialCard";
import CredentialDetail from "../../components/user/CredentialDetail";

export default function Credentials() {
  const { account, contract } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    // Load credentials when component mounts
    if (contract && account) {
      loadCredentials();
    }
  }, [contract, account]);

  const loadCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredentials = await contract.getAllCredentials(account);
      setCredentials(userCredentials);
    } catch (err) {
      console.error("Error loading credentials:", err);
      setError("Failed to load credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewCredential = (credential, index) => {
    setSelectedCredential(credential);
    setSelectedIndex(index);
  };

  const closeDetail = () => {
    setSelectedCredential(null);
    setSelectedIndex(null);
  };

  // After updating privacy settings, reload credentials
  const handlePrivacyUpdated = () => {
    loadCredentials();
    closeDetail();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadCredentials}
              className="mt-2 text-red-700 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Credentials</h1>
        <button
          onClick={loadCredentials}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {credentials.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>You don't have any credentials yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((credential, index) => (
            <CredentialCard
              key={index}
              credential={credential}
              index={index}
              onClick={() => viewCredential(credential, index)}
            />
          ))}
        </div>
      )}

      {selectedCredential && (
        <CredentialDetail
          credential={selectedCredential}
          index={selectedIndex}
          onClose={closeDetail}
          onPrivacyUpdated={handlePrivacyUpdated}
        />
      )}
    </div>
  );
}