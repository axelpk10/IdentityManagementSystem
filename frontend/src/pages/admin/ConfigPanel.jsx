// src/pages/admin/ConfigPanel.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import Loading from "../../components/common/Loading";
import { Link } from "react-router-dom";

export default function ConfigPanel() {
  const { contract, account } = useAuth();
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Configuration state
  const [config, setConfig] = useState({
    contractAddress: "",
    adminAddress: "",
    network: "",
    chainId: "",
  });

  // Network settings
  const supportedNetworks = [
    {
      id: 1,
      name: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_ID",
    },
    {
      id: 5,
      name: "Goerli Testnet",
      rpcUrl: "https://goerli.infura.io/v3/YOUR_INFURA_ID",
    },
    {
      id: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_ID",
    },
    {
      id: 80001,
      name: "Mumbai Testnet",
      rpcUrl: "https://polygon-mumbai.infura.io/v3/YOUR_INFURA_ID",
    },
    { id: 31337, name: "Hardhat Local", rpcUrl: "http://127.0.0.1:8545" },
  ];

  useEffect(() => {
    if (contract) {
      loadContractInfo();
    }
  }, [contract]);

  const loadContractInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get contract address from the instance
      const contractAddress = contract.address;

      // Get admin address from the contract
      const adminAddress = await contract.admin();

      // Get network information
      const provider = contract.provider;
      const network = await provider.getNetwork();

      setConfig({
        contractAddress,
        adminAddress,
        network: network.name,
        chainId: network.chainId,
      });
    } catch (err) {
      console.error("Error loading contract info:", err);
      setError("Failed to load contract information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = async (networkId) => {
    // This function would be more practical if we had a function in the
    // contract to change networks, which isn't typically possible.
    // Instead, this demonstrates UI handling for network switching.

    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    setTxPending(true);
    try {
      // Try to switch to the selected network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${parseInt(networkId).toString(16)}` }],
      });

      setSuccess(`Network switch requested to chainId: ${networkId}`);

      // Note: The page will likely refresh when network changes
      // so we don't need to update state here
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const network = supportedNetworks.find(
            (n) => n.id === parseInt(networkId)
          );
          if (!network) {
            throw new Error("Unsupported network");
          }

          // Add the network to MetaMask
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${parseInt(networkId).toString(16)}`,
                chainName: network.name,
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [""], // Add appropriate explorer URLs
              },
            ],
          });
          setSuccess(`Added and switched to network: ${network.name}`);
        } catch (addError) {
          console.error("Error adding network:", addError);
          setError(`Failed to add network: ${addError.message}`);
        }
      } else {
        console.error("Error switching network:", switchError);
        setError(`Failed to switch network: ${switchError.message}`);
      }
    } finally {
      setTxPending(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Configuration Panel
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={loadContractInfo}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
          <Link
            to="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Information */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Contract Information</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Contract Address</p>
              <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm break-all">
                {config.contractAddress}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Admin Address</p>
              <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm break-all">
                {config.adminAddress}
              </div>
              {account &&
                account.toLowerCase() === config.adminAddress.toLowerCase() && (
                  <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    This is you
                  </span>
                )}
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Network</p>
                <div className="bg-white p-3 rounded border border-gray-200">
                  {config.network || "Unknown"}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Chain ID</p>
                <div className="bg-white p-3 rounded border border-gray-200">
                  {config.chainId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Network Settings</h2>

          <p className="text-sm text-gray-600 mb-4">
            Switch the network your wallet is connected to. Note that changing
            networks will reload the application.
          </p>

          <div className="space-y-3">
            {supportedNetworks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleNetworkChange(network.id)}
                disabled={txPending || network.id === config.chainId}
                className={`w-full p-3 rounded flex justify-between items-center transition-colors ${
                  network.id === config.chainId
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-white hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="font-medium">{network.name}</span>
                <span className="text-xs text-gray-500">
                  Chain ID: {network.id}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* System Parameters */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Parameters</h2>

          <p className="text-gray-600 text-sm italic mb-4">
            Note: Changing system parameters requires contract redeployment or
            upgradeable contracts. The current contract does not support
            parameter changes.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Credential Expiry (Days)
              </label>
              <input
                type="number"
                disabled
                value="365"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default expiry period for newly issued credentials
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Credential Visibility
              </label>
              <select
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
              >
                <option>Private</option>
                <option>Public</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Default visibility for newly issued credentials
              </p>
            </div>
          </div>
        </div>

        {/* Support and Documentation */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Support and Documentation
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">
                System Documentation
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Access user guides, developer documentation, and administrative
                resources.
              </p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                View Documentation
              </button>
            </div>

            <div>
              <h3 className="font-medium text-gray-800">Contact Support</h3>
              <p className="text-gray-600 text-sm mt-1">
                Need help? Contact our technical support team.
              </p>
              <a
                href="mailto:support@example.com"
                className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Contact Support
              </a>
            </div>

            <div>
              <h3 className="font-medium text-gray-800">System Version</h3>
              <p className="text-gray-600 text-sm mt-1">
                Identity Management System v1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
