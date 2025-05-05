import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/contractInfo";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check for connected accounts
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            await connectWallet();
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error checking connection:", err);
          setError("Failed to check wallet connection");
          setLoading(false);
        }
      } else {
        setError("MetaMask is not installed");
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // User switched accounts
          connectWallet();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [account]);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      // Set up ethers provider and contract instance
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        ethersSigner
      );

      // Get user role from contract
      const userRole = await contractInstance.userRoles(userAddress);
      const adminAddress = await contractInstance.admin();
      const isUserAdmin =
        userAddress.toLowerCase() === adminAddress.toLowerCase();

      console.log("Connected wallet:", userAddress, "Role:", userRole);
      // Save all state
      setAccount(userAddress);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      setRole(userRole || "user"); // Default to "user" if no role is assigned
      setIsAdmin(isUserAdmin);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setRole(null);
    setIsAdmin(false);
    setProvider(null);
    setSigner(null);
    setContract(null);
    // Note: MetaMask doesn't have a "disconnect" method,
    // we just clear our state and stop listening to the account
  };

  const value = {
    account,
    role,
    isAdmin,
    loading,
    error,
    provider,
    signer,
    contract,
    connectWallet,
    disconnectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
