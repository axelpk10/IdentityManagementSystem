// src/components/common/NetworkChecker.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function NetworkChecker() {
  const [network, setNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  // Set this to the network ID you want to use
  // 1: Ethereum Mainnet, 5: Goerli Testnet, 11155111: Sepolia, 80001: Mumbai Testnet, etc.
  const REQUIRED_NETWORK_ID = 31337; // Example: Sepolia Testnet
  const REQUIRED_NETWORK_NAME = "Hardhat"; // Example: Sepolia Testnet

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          setNetwork(network);
          setIsCorrectNetwork(network.chainId === REQUIRED_NETWORK_ID);
        } catch (error) {
          console.error("Error checking network:", error);
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        checkNetwork();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", checkNetwork);
      }
    };
  }, []);

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    setIsSwitching(true);
    try {
      // Try to switch to the required network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${REQUIRED_NETWORK_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network to MetaMask
          // This is a simplified example - you should include proper network parameters
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${REQUIRED_NETWORK_ID.toString(16)}`,
                chainName: REQUIRED_NETWORK_NAME,
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["http://127.0.0.1:8545"], // Example RPC URL
                blockExplorerUrls: ["https://sepolia.etherscan.io"], // Example explorer URL
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding network:", addError);
        }
      } else {
        console.error("Error switching network:", switchError);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!network || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">
            You are currently connected to <strong>{network.name}</strong>{" "}
            network. This application requires{" "}
            <strong>{REQUIRED_NETWORK_NAME}</strong>.
          </p>
          <button
            onClick={switchNetwork}
            disabled={isSwitching}
            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {isSwitching
              ? "Switching..."
              : `Switch to ${REQUIRED_NETWORK_NAME}`}
          </button>
        </div>
      </div>
    </div>
  );
}
