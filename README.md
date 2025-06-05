# Blockchain-Based Identity Management System

## Overview

This project is a decentralized identity management system aimed at solving the limitations of traditional identity frameworks that rely on centralized authorities. These conventional systems often suffer from issues such as lack of user control, risk of data breaches, limited transparency, and difficulty in verifying credentials across platforms.

**Need for the Project**  
In an increasingly digital and privacy-conscious world, users require greater control over their personal data. There is a strong need for a system where:
- Users **own and manage** their identities
- Issuers can **securely issue tamper-proof credentials**
- Verifiers can **authenticate credentials without compromising privacy**
- All actions are **transparent and traceable**, yet **privacy-respecting**

This project addresses these needs by leveraging blockchain and IPFS technologies to build a trustless, role-based identity management platform.

## Key Features

- **MetaMask Authentication**: Secure login using Ethereum wallets
- **Smart Contract Integration**: Role detection and on-chain identity logic
- **Role-Based Access Control**: Permissions tailored to Admin, Issuer, User, and Verifier
- **IPFS Storage**: Decentralized file storage with verifiable document hashes
- **User Privacy Management**: Users can control access to their credentials
- **Credential Issuance and Verification**: Streamlined flow for issuing, managing, and verifying digital credentials

## User Roles

- **Admin**: Assigns roles, manages users, and configures system settings
- **Issuer**: Issues and revokes credentials, manages issued documents
- **User**: Views and controls access to personal credentials
- **Verifier**: Requests and verifies user credentials with consent

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Blockchain Interaction**: Ethers.js, MetaMask
- **Smart Contracts**: Solidity (Ethereum-compatible)
- **File Storage**: IPFS (InterPlanetary File System)

## Project Objective

The core goal is to build a decentralized, secure, and user-centric identity management platform that:
- Reduces dependency on centralized identity providers
- Empowers users with full ownership of their credentials
- Enables seamless and privacy-preserving verification across systems
