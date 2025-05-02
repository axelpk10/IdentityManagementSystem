import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import IdentityManagementABI from "../contracts/IdentityManagement.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const AuthContext = createContext();
const isDev = import.meta.env.DEV;



export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        setIsLoading(true);
        if (!window.ethereum) {
          setError("No wallet detected. Please install MetaMask.");
          setIsLoading(false);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length !== 0) {
          await connectWallet(); 
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setError("Error connecting to wallet.");
      } finally {
        setIsLoading(false);
      }
    };

    checkIfWalletIsConnected();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else {
        // Account changed, update state
        setCurrentAccount(accounts[0]);
        fetchUserRole(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("No wallet detected. Please install MetaMask.");
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      setCurrentAccount(account);

      // Set up provider, signer and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const signer = provider.getSigner();
      setSigner(signer);

      const contract = new ethers.Contract(
        contractAddress,
        IdentityManagementABI.abi,
        signer
      );
      setContract(contract);

      // Fetch user role from contract
      await fetchUserRole(account);

      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError(error.message || "Failed to connect wallet");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async (address) => {
    try {
      if (!provider) return;

      const tempContract = new ethers.Contract(
        contractAddress,
        IdentityManagementABI.abi,
        provider
      );

      const role = await tempContract.userRoles(address);
      setUserRole(role || "user"); // Default to "user" if no role is set
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("user"); // Default to user on error
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount(null);
    setUserRole(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
  };

  const verifySignature = async (message) => {
    try {
      if (!signer) throw new Error("Wallet not connected");

      // Create a unique message to sign
      const timestamp = Date.now();
      const fullMessage = `${message}_${timestamp}`;

      // Request signature
      const signature = await signer.signMessage(fullMessage);

      // For demonstration - in a real app you might verify this server-side
      const recoveredAddress = ethers.utils.verifyMessage(
        fullMessage,
        signature
      );

      return recoveredAddress.toLowerCase() === currentAccount.toLowerCase();
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  };

  const value = {
    currentAccount,
    userRole,
    isLoading,
    isConnected,
    error,
    provider,
    signer,
    contract,
    connectWallet,
    disconnectWallet,
    verifySignature,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
