// src/components/common/CredentialCard.jsx
import React, { useState, useEffect } from 'react';
import IPFSService from '../../services/IPFSService';
import { ethers } from 'ethers';

const CredentialCard = ({ 
  credential, 
  index, 
  userAddress, 
  onAllowVerifier,
  onRevoke,
  issuerView = false, // Boolean indicating if viewed in issuer context
  verifierView = false // Boolean indicating if viewed in verifier context
}) => {
  const [credentialData, setCredentialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifierAddress, setVerifierAddress] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const ipfsService = new IPFSService();

  useEffect(() => {
    const fetchCredentialData = async () => {
      try {
        if (credential.ipfsHash) {
          const data = await ipfsService.getCredentialJSON(credential.ipfsHash);
          setCredentialData(data);
        }
      } catch (error) {
        console.error("Error fetching credential data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentialData();
  }, [credential.ipfsHash]);

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleAllowVerifier = () => {
    if (verifierAddress && ethers.utils.isAddress(verifierAddress)) {
      onAllowVerifier(index, verifierAddress);
      setVerifierAddress('');
    } else {
      alert('Please enter a valid Ethereum address');
    }
  };

  // Function to determine credential status with expiry check
  const getCredentialStatus = () => {
    if (credential.isRevoked) return { status: 'revoked', label: 'REVOKED', color: 'text-red-600' };
    
    // Check if expired
    if (credential.expiresAt > 0 && credential.expiresAt * 1000 < Date.now()) {
      return { status: 'expired', label: 'EXPIRED', color: 'text-amber-600' };
    }
    
    return { status: 'active', label: 'ACTIVE', color: 'text-green-600' };
  };

  const status = getCredentialStatus();

  // Calculate time until expiry for display
  const getTimeUntilExpiry = () => {
    if (!credential.expiresAt || credential.expiresAt === 0) return null;
    
    const expiryDate = new Date(credential.expiresAt * 1000);
    const now = new Date();
    
    if (expiryDate < now) return 'Expired';
    
    const diffTime = Math.abs(expiryDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `Expires in ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    
    return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const expiryInfo = getTimeUntilExpiry();

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-48 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading credential...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Status Badge */}
      <div className={`${status.color} text-xs font-semibold px-2 py-1 bg-opacity-10 inline-block m-2 rounded`}>
        {status.label}
      </div>
      
      {/* Card Header */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 text-gray-800">{credential.title}</h3>
        <p className="text-sm text-gray-600 mb-2">Issued by: {credential.issuer}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {/* Visibility Tag */}
          <span className={`text-xs px-2 py-0.5 rounded ${
            credential.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {credential.isPublic ? 'Public' : 'Private'}
          </span>
          
          {/* Issuer View Tag */}
          {issuerView && (
            <span className="bg-gray-