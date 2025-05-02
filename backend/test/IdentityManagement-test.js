const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityManagement", function () {
  let identityManagement;
  let owner;
  let issuer;
  let user;
  let verifier;

  beforeEach(async function () {
    // Get signers
    [owner, issuer, user, verifier] = await ethers.getSigners();

    // Deploy contract
    const IdentityManagement = await ethers.getContractFactory(
      "IdentityManagement"
    );
    identityManagement = await IdentityManagement.deploy();

    // Assign issuer role
    await identityManagement.assignRole(issuer.address, "issuer");
  });

  describe("Role Management", function () {
    it("Should set the deployer as admin", async function () {
      expect(await identityManagement.admin()).to.equal(owner.address);
      expect(await identityManagement.userRoles(owner.address)).to.equal(
        "admin"
      );
    });

    it("Should allow admin to assign roles", async function () {
      await identityManagement.assignRole(user.address, "user");
      expect(await identityManagement.userRoles(user.address)).to.equal("user");
    });

    it("Should prevent non-admin from assigning roles", async function () {
      await expect(
        identityManagement
          .connect(user)
          .assignRole(verifier.address, "verifier")
      ).to.be.revertedWith("Only admin allowed");
    });
  });

  describe("Credential Management", function () {
    it("Should allow issuer to create a credential", async function () {
      await identityManagement.connect(issuer).issueCredential(
        user.address,
        "College Degree",
        "University",
        "QmHash123",
        true, // isPublic
        0 // never expires
      );

      const credential = await identityManagement.getCredential(
        user.address,
        0
      );
      expect(credential.title).to.equal("College Degree");
      expect(credential.issuer).to.equal("University");
      expect(credential.ipfsHash).to.equal("QmHash123");
      expect(credential.isPublic).to.equal(true);
    });

    it("Should prevent non-issuer from creating credentials", async function () {
      await expect(
        identityManagement
          .connect(user)
          .issueCredential(
            user.address,
            "Fake Degree",
            "Fake University",
            "QmFake",
            true,
            0
          )
      ).to.be.revertedWith("Only issuers allowed");
    });

    it("Should allow owner to grant access to a verifier", async function () {
      await identityManagement.connect(issuer).issueCredential(
        user.address,
        "Private Cert",
        "Company",
        "QmPrivate123",
        false, // isPrivate
        0
      );

      // Grant access to verifier
      await identityManagement
        .connect(user)
        .allowVerifier(user.address, 0, verifier.address);

      const credential = await identityManagement
        .connect(verifier)
        .getCredential(user.address, 0);
      expect(credential.title).to.equal("Private Cert");
    });

    it("Should prevent unauthorized access to private credentials", async function () {
      // Create a private credential
      await identityManagement.connect(issuer).issueCredential(
        user.address,
        "Private Cert",
        "Company",
        "QmPrivate123",
        false, // isPrivate
        0
      );

      await expect(
        identityManagement.connect(verifier).getCredential(user.address, 0)
      ).to.be.revertedWith("Not authorized to view this credential");
    });

    it("Should allow issuer to revoke a credential", async function () {
      // Create credential
      await identityManagement
        .connect(issuer)
        .issueCredential(
          user.address,
          "Membership",
          "Club",
          "QmMember123",
          true,
          0
        );

      // Revoke credential
      await identityManagement
        .connect(issuer)
        .revokeCredential(user.address, 0);

      // Check if revoked
      const credential = await identityManagement.getCredential(
        user.address,
        0
      );
      expect(credential.isRevoked).to.equal(true);
    });
  });

  describe("Credential Retrieval", function () {
    beforeEach(async function () {
      await identityManagement.connect(issuer).issueCredential(
        user.address,
        "Public Cert",
        "Public Co",
        "QmPublic123",
        true, // isPublic
        0
      );

      await identityManagement.connect(issuer).issueCredential(
        user.address,
        "Private Cert",
        "Private Co",
        "QmPrivate123",
        false, // isPrivate
        0
      );
    });

    it("Should retrieve only public credentials", async function () {
      const publicCreds = await identityManagement.getPublicCredentials(
        user.address
      );
      expect(publicCreds.length).to.equal(1);
      expect(publicCreds[0].title).to.equal("Public Cert");
    });

    it("Should allow owner to get all their credentials", async function () {
      const allCreds = await identityManagement
        .connect(user)
        .getAllCredentials(user.address);
      expect(allCreds.length).to.equal(2);
    });

    it("Should prevent others from getting all credentials", async function () {
      await expect(
        identityManagement.connect(verifier).getAllCredentials(user.address)
      ).to.be.revertedWith("Only the owner can view all their credentials");
    });
  });

  describe("Events", function () {
    it("Should emit CredentialIssued event", async function () {
      await expect(
        identityManagement
          .connect(issuer)
          .issueCredential(
            user.address,
            "Event Test",
            "Event Co",
            "QmEvent123",
            true,
            0
          )
      )
        .to.emit(identityManagement, "CredentialIssued")
        .withArgs(user.address, "Event Test", "Event Co");
    });

    it("Should emit VerifierAdded event", async function () {
      // Create credential
      await identityManagement
        .connect(issuer)
        .issueCredential(
          user.address,
          "Private Cert",
          "Company",
          "QmPrivate123",
          false,
          0
        );

      await expect(
        identityManagement
          .connect(user)
          .allowVerifier(user.address, 0, verifier.address)
      )
        .to.emit(identityManagement, "VerifierAdded")
        .withArgs(user.address, 0, verifier.address);
    });
  });

  describe("Expiration and Edge Cases", function () {
    it("Should respect credential expiration", async function () {
      // Current block timestamp plus 1 day in seconds
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expiryTime = currentTimestamp + 86400; // 1 day from now

      await identityManagement
        .connect(issuer)
        .issueCredential(
          user.address,
          "Temporary Cert",
          "Temp Co",
          "QmTemp123",
          true,
          expiryTime
        );

      const credential = await identityManagement.getCredential(
        user.address,
        0
      );
      expect(credential.expiresAt).to.equal(expiryTime);
    });

    it("Should handle invalid credential indices", async function () {
      await expect(
        identityManagement.getCredential(user.address, 99)
      ).to.be.revertedWith("Invalid index");
    });
  });
});
