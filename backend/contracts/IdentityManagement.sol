// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract IdentityManagement {
    struct Credential {
        string title;               // Human-readable title
        string issuer;              // Name of the issuing organization
        string ipfsHash;            // IPFS CID for the actual credential
        uint256 issuedAt;           // Timestamp of issuance
        uint256 expiresAt;          // Optional expiry timestamp (0 = never expires)
        bool isRevoked;             // Credential revocation status
        bool isPublic;              // Visibility: true = public, false = private
        address[] allowedVerifiers; // Addresses explicitly allowed to view (for private)
    }
    
    mapping(address => Credential[]) private userCredentials;
    mapping(address => string) public userRoles;
    
    address public admin;
    
    event CredentialIssued(address indexed to, string title, string issuer);
    event CredentialRevoked(address indexed user, uint index);
    event RoleAssigned(address indexed user, string role);
    event VerifierAdded(address indexed user, uint indexed credentialIndex, address verifier);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }
    
    modifier onlyIssuer() {
        require(
            keccak256(abi.encodePacked(userRoles[msg.sender])) == keccak256(abi.encodePacked("issuer")),
            "Only issuers allowed"
        );
        _;
    }
    
    constructor() {
        admin = msg.sender;
        userRoles[msg.sender] = "admin";
    }
    
    function assignRole(address user, string memory role) public onlyAdmin {
        userRoles[user] = role;
        emit RoleAssigned(user, role);
    }
    
    function issueCredential(
        address user,
        string memory title,
        string memory issuer,
        string memory ipfsHash,
        bool isPublic,
        uint256 expiresAt
    ) public onlyIssuer {
        Credential memory newCredential = Credential({
            title: title,
            issuer: issuer,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false,
            isPublic: isPublic,
            allowedVerifiers: new address[](0)  // Create an empty dynamic array
        });
        
        userCredentials[user].push(newCredential);
        emit CredentialIssued(user, title, issuer);
    }
    
    function revokeCredential(address user, uint index) public onlyIssuer {
        require(index < userCredentials[user].length, "Invalid index");
        userCredentials[user][index].isRevoked = true;
        emit CredentialRevoked(user, index);
    }
    
    function allowVerifier(address user, uint index, address verifier) public {
        require(msg.sender == user, "Only owner can grant access");
        require(index < userCredentials[user].length, "Invalid credential index");
        require(!userCredentials[user][index].isPublic, "Credential is already public");
        
        userCredentials[user][index].allowedVerifiers.push(verifier);
        emit VerifierAdded(user, index, verifier);
    }
    
    function getCredential(address user, uint index) public view returns (Credential memory) {
        require(index < userCredentials[user].length, "Invalid index");
        
        Credential memory cred = userCredentials[user][index];
        
        if (!cred.isPublic) {
            require(
                msg.sender == user || isVerifierAllowed(user, index, msg.sender),
                "Not authorized to view this credential"
            );
        }
        
        return cred;
    }
    
    function getAllCredentials(address user) public view returns (Credential[] memory) {
        require(msg.sender == user, "Only the owner can view all their credentials");
        return userCredentials[user];
    }
    
    function getPublicCredentials(address user) public view returns (Credential[] memory) {
        uint count = 0;
        
        // First count public credentials
        for (uint i = 0; i < userCredentials[user].length; i++) {
            if (userCredentials[user][i].isPublic) {
                count++;
            }
        }
        
        // Then create and populate the array
        Credential[] memory publicCreds = new Credential[](count);
        uint index = 0;
        
        for (uint i = 0; i < userCredentials[user].length; i++) {
            if (userCredentials[user][i].isPublic) {
                publicCreds[index] = userCredentials[user][i];
                index++;
            }
        }
        
        return publicCreds;
    }
    
    function isVerifierAllowed(address user, uint index, address verifier) internal view returns (bool) {
        address[] memory allowed = userCredentials[user][index].allowedVerifiers;
        for (uint i = 0; i < allowed.length; i++) {
            if (allowed[i] == verifier) {
                return true;
            }
        }
        return false;
    }
}