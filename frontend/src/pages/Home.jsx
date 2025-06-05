import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const { account, role, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on role if authenticated
    if (account) {
      if (isAdmin) {
        navigate("/admin");
      } else if (role === "issuer") {
        navigate("/issuer");
      } else {
        navigate("/user");
      }
    }
  }, [account, role, isAdmin, navigate]);

  return (
    <div className="flex flex-col items-center justify-center height-[100vh] bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome to the Identity Management System
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Connect your wallet to access your digital credentials and identity
          information.
        </p>
        <div className="flex justify-center">
          {/* ConnectWallet button will be shown from the Header */}
        </div>
      </div>
    </div>
  );
}
