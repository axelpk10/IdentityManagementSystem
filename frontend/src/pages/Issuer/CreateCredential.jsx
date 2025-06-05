// src/pages/Issuer/CreateCredential.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { uploadFile, uploadMetadataToIPFS } from "../../services/ipfsService";
import { ethers } from "ethers";

export default function CreateCredential() {
  const { contract } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userAddress: "",
    title: "",
    issuer: "",
    description: "",
    isPublic: true,
    expiryDate: "", // YYYY-MM-DD format
    documentFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const validateForm = () => {
    if (!ethers.utils.isAddress(formData.userAddress)) {
      setError("Please enter a valid Ethereum address");
      return false;
    }

    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }

    if (!formData.issuer.trim()) {
      setError("Issuer name is required");
      return false;
    }

    if (!formData.documentFile) {
      setError("Please select a file to upload");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(10);

    try {
      // 1. Upload document to IPFS
      setUploadProgress(20);
      const documentCid = await uploadFile(formData.documentFile);
      setUploadProgress(50);

      // 2. Create metadata and upload to IPFS
      const metadata = {
        title: formData.title,
        description: formData.description,
        documentCid: documentCid,
        createdAt: new Date().toISOString(),
      };

      const metadataCid = await uploadMetadataToIPFS(metadata);
      setUploadProgress(70);

      // 3. Calculate expiry timestamp (or 0 if no expiry)
      const expiryTimestamp = formData.expiryDate
        ? Math.floor(new Date(formData.expiryDate).getTime() / 1000)
        : 0;

      // 4. Issue credential on the blockchain
      const tx = await contract.issueCredential(
        formData.userAddress,
        formData.title,
        formData.issuer, // Current issuer name (could be fetched from a profile)
        metadataCid,
        formData.isPublic,
        expiryTimestamp
      );

      setUploadProgress(90);

      // 5. Wait for transaction confirmation
      await tx.wait();
      setTransactionHash(tx.hash);
      setUploadProgress(100);

      // 6. Show success message
      setSuccess(true);

      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          userAddress: "",
          title: "",
          description: "",
          isPublic: true,
          expiryDate: "",
          documentFile: null,
        });

        // Reset file input (since React doesn't handle it directly)
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }, 3000);
    } catch (err) {
      console.error("Error issuing credential:", err);
      setError(err.message || "Failed to issue credential");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/issuer");
  };

  const goToManage = () => {
    navigate("/issuer/manage");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Issue New Credential
        </h1>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {success ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 font-medium text-green-800">
                Credential successfully issued!
              </p>
              <p className="text-sm leading-5 text-green-700 mt-1">
                Transaction Hash: {transactionHash.slice(0, 10)}...
                {transactionHash.slice(-8)}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="mr-4 text-sm text-green-700 hover:text-green-600"
                >
                  Issue Another
                </button>
                <button
                  onClick={goToManage}
                  className="text-sm text-green-700 hover:text-green-600"
                >
                  View All Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm leading-5 text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="userAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recipient Address *
            </label>
            <input
              type="text"
              id="userAddress"
              name="userAddress"
              value={formData.userAddress}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Credential Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
              placeholder="e.g. College Degree Certificate"
              required
            />
          </div>

          <div>
            <label
              htmlFor="issuer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Issuer Name *
            </label>
            <input
              type="text"
              id="issuer"
              name="issuer"
              value={formData.issuer}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
              placeholder="e.g. University of Technology"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="block w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
              placeholder="Additional details about this credential..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="documentFile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload Document *
            </label>
            <input
              type="file"
              id="documentFile"
              name="documentFile"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: PDF, PNG, JPG (max 10MB)
            </p>
          </div>

          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if the credential never expires
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPublic"
              className="ml-2 block text-sm text-gray-700"
            >
              Make credential publicly visible
            </label>
          </div>

          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uploading and processing... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Issuing..." : "Issue Credential"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
