// src/services/ipfsService.js

// Using the Infura IPFS API (you'll need to create an account and get project ID and secret)
// For production, you should store these in environment variables
const INFURA_PROJECT_ID = "YOUR_INFURA_PROJECT_ID";
const INFURA_API_SECRET = "YOUR_INFURA_API_SECRET";

// Basic auth for Infura
const auth =
  "Basic " +
  Buffer.from(INFURA_PROJECT_ID + ":" + INFURA_API_SECRET).toString("base64");

/**
 * Upload a file to IPFS via Infura
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS CID (Content Identifier)
 */
export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
      method: "POST",
      headers: {
        Authorization: auth,
      },
      body: formData,
    });

    const data = await response.json();
    return data.Hash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload to IPFS");
  }
};

/**
 * Upload JSON metadata to IPFS
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<string>} - The IPFS CID
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const blob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });
    const file = new File([blob], "metadata.json");

    return await uploadToIPFS(file);
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

/**
 * Get the IPFS gateway URL for a given CID
 * @param {string} cid - The IPFS Content Identifier
 * @returns {string} - The gateway URL
 */
export const getIPFSGatewayURL = (cid) => {
  return `https://ipfs.io/ipfs/${cid}`;
};

/**
 * Fallback function to use mock IPFS for development
 * Used when actual IPFS integration is not set up
 * @param {File} file - The file to mock upload
 * @returns {Promise<string>} - A fake CID
 */
export const mockUploadToIPFS = async (file) => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a fake CID based on timestamp and random string
      const fakeCid = `Qm${Date.now().toString(16)}${Math.random()
        .toString(16)
        .substring(2, 10)}`;
      resolve(fakeCid);
    }, 1500);
  });
};

/**
 * Determine if we should use real IPFS or mock service
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS CID
 */
export const uploadFile = async (file) => {
  // If INFURA credentials are not set, use mock service
  if (INFURA_PROJECT_ID === "YOUR_INFURA_PROJECT_ID") {
    console.warn(
      "Using mock IPFS service. For production, set up proper IPFS integration."
    );
    return mockUploadToIPFS(file);
  }

  return uploadToIPFS(file);
};
