import { useAuth } from "../../context/AuthContext";

export default function ConnectWallet() {
  const { account, loading, error, connectWallet, disconnectWallet } =
    useAuth();

  return (
    <div className="flex items-center space-x-2">
      {account ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
