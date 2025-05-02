import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function ProfilePage() {
  const { currentAccount, userRole, disconnectWallet, contract } = useAuth();
  const [copied, setCopied] = useState(false);
  const [ensName, setEnsName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Try to fetch ENS name if available
    const fetchEnsName = async () => {
      try {
        if (window.ethereum && currentAccount) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const name = await provider.lookupAddress(currentAccount);
          if (name) setEnsName(name);
        }
      } catch (error) {
        console.error("Error fetching ENS name:", error);
      }
    };

    fetchEnsName();
  }, [currentAccount]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    disconnectWallet();
    window.location.href = "/login";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Wallet Address</h2>
          <div className="flex items-center">
            <div className="bg-gray-100 p-3 rounded-md flex-1 font-mono text-sm break-all">
              {currentAccount}
            </div>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {ensName && (
            <div className="mt-2 text-gray-600">
              ENS Name: <span className="font-medium">{ensName}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Role</h2>
          <div className="bg-gray-100 p-3 rounded-md">
            <span
              className={`font-medium ${
                userRole === "admin"
                  ? "text-purple-700"
                  : userRole === "issuer"
                  ? "text-green-700"
                  : "text-blue-700"
              }`}
            >
              {userRole || "Regular User"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {userRole === "admin"
              ? "You have administrative privileges."
              : userRole === "issuer"
              ? "You can issue credentials to users."
              : "You can manage your credentials."}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
