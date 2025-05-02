import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const {
    connectWallet,
    isConnected,
    currentAccount,
    userRole,
    isLoading,
    error,
  } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on role if already connected
    if (isConnected && userRole) {
      redirectBasedOnRole();
    }
  }, [isConnected, userRole]);

  const handleConnect = async () => {
    setConnecting(true);
    const success = await connectWallet();
    setConnecting(false);

    if (success) {
      redirectBasedOnRole();
    }
  };

  const redirectBasedOnRole = () => {
    switch (userRole) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "issuer":
        navigate("/issuer/dashboard");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Identity Management System
        </h1>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {isConnected ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Connected: {currentAccount.substring(0, 6)}...
              {currentAccount.substring(currentAccount.length - 4)}
            </div>
            <p className="mb-4">
              Role:{" "}
              <span className="font-semibold">
                {userRole || "Regular User"}
              </span>
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full"
              onClick={redirectBasedOnRole}
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-gray-600 text-center">
              Connect your wallet to access the Identity Management System
            </p>

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
              onClick={handleConnect}
              disabled={connecting || isLoading}
            >
              {connecting || isLoading ? (
                <span>Connecting...</span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>

            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>
                Need help?{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  How to connect your wallet
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
