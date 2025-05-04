// src/components/user/VerifierControl.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";

export default function VerifierControl({
  credential,
  index,
  onClose,
  onUpdate,
}) {
  const { contract, account } = useAuth();
  const [newVerifier, setNewVerifier] = useState("");
  const [isAddingVerifier, setIsAddingVerifier] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isValidAddress = (address) => {
    try {
      return ethers.utils.isAddress(address);
    } catch (e) {
      return false;
    }
  };

  const addVerifier = async () => {
    if (!isValidAddress(newVerifier)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setIsAddingVerifier(true);
    setError(null);
    setSuccess(null);

    try {
      await contract.allowVerifier(account, index, newVerifier);
      setSuccess(`Verifier ${newVerifier} added successfully!`);
      setNewVerifier("");

      // Optionally refresh parent data
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error adding verifier:", err);
      setError("Failed to add verifier. Please try again.");
    } finally {
      setIsAddingVerifier(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Manage Verifier Access</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
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

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Authorized Verifiers
            </h3>
            {credential.allowedVerifiers.length === 0 ? (
              <p className="text-gray-600 italic">No verifiers authorized</p>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-auto">
                <ul className="space-y-1">
                  {credential.allowedVerifiers.map((address, i) => (
                    <li
                      key={i}
                      className="font-mono text-sm flex justify-between items-center"
                    >
                      <span>
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                      <span className="text-gray-400">{address}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="verifier-address"
              className="block text-sm font-medium text-gray-700"
            >
              Add New Verifier
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="verifier-address"
                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Ethereum Address (0x...)"
                value={newVerifier}
                onChange={(e) => setNewVerifier(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={addVerifier}
              disabled={isAddingVerifier || !newVerifier}
            >
              {isAddingVerifier ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Add Verifier"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
