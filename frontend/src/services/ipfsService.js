// src/services/ipfsService.js
import { create } from "ipfs-http-client";

// Configure IPFS - using local node for development
// For production, you'd want to use a dedicated IPFS service like Infura or Pinata
const ipfs = create({ host: "localhost", port: 5001, protocol: "http" });

/**
 * Uploads a file to IPFS
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS CID (Content Identifier)
 */
export const uploadFile = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const { cid } = await ipfs.add(buffer);
    return cid.toString();
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

/**
 * Uploads metadata to IPFS
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<string>} - The IPFS CID (Content Identifier)
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const metadataString = JSON.stringify(metadata);
    const { cid } = await ipfs.add(metadataString);
    return cid.toString();
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

/**
 * Retrieves content from IPFS by CID
 * @param {string} cid - The IPFS CID (Content Identifier)
 * @returns {Promise<Blob>} - The retrieved content as a Blob
 */
export const getFromIPFS = async (cid) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return new Blob(chunks);
  } catch (error) {
    console.error("Error retrieving from IPFS:", error);
    throw new Error("Failed to retrieve content from IPFS");
  }
};

/**
 * Gets metadata from IPFS and parses it as JSON
 * @param {string} cid - The IPFS CID (Content Identifier)
 * @returns {Promise<Object>} - The parsed metadata object
 */
export const getMetadataFromIPFS = async (cid) => {
  try {
    const blob = await getFromIPFS(cid);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error retrieving metadata from IPFS:", error);
    throw new Error("Failed to retrieve metadata from IPFS");
  }
};

/**
 * Generates an IPFS gateway URL for a given CID
 * @param {string} cid - The IPFS CID (Content Identifier)
 * @returns {string} - The gateway URL
 */
export const getIPFSGatewayUrl = (cid) => {
  // For local development
  return `http://localhost:8080/ipfs/${cid}`;

  // For production, you might use a public gateway like:
  // return `https://ipfs.io/ipfs/${cid}`;
};

/**
 * Retrieves a document from IPFS using the metadata CID
 * First gets the metadata, then retrieves the actual document using the documentCid
 * @param {string} metadataCid - The IPFS CID for the metadata
 * @returns {Promise<{blob: Blob, metadata: Object}>} - The document blob and metadata
 */
export const getDocumentFromMetadata = async (metadataCid) => {
  try {
    // First get the metadata
    const metadata = await getMetadataFromIPFS(metadataCid);

    if (!metadata.documentCid) {
      throw new Error("No document CID found in metadata");
    }

    // Then get the actual document using the documentCid from metadata
    const documentBlob = await getFromIPFS(metadata.documentCid);

    return {
      blob: documentBlob,
      metadata: metadata,
    };
  } catch (error) {
    console.error("Error retrieving document from metadata:", error);
    throw new Error("Failed to retrieve document from IPFS metadata");
  }
};

/**
 * Returns a direct URL to the document from the metadata CID
 * @param {string} metadataCid - The IPFS CID for the metadata
 * @returns {Promise<string>} - The direct URL to the document
 */
export const getDocumentUrlFromMetadata = async (metadataCid) => {
  try {
    const metadata = await getMetadataFromIPFS(metadataCid);

    if (!metadata.documentCid) {
      throw new Error("No document CID found in metadata");
    }

    return getIPFSGatewayUrl(metadata.documentCid);
  } catch (error) {
    console.error("Error getting document URL:", error);
    throw new Error("Failed to get document URL from metadata");
  }
};
