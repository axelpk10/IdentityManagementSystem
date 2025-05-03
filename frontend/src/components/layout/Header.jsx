import ConnectWallet from "../common/ConnectWallet";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { account, role, isAdmin } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">
              Identity Management System
            </h1>
            {account && role && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                Role: {isAdmin ? "Admin" : role}
              </span>
            )}
          </div>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
