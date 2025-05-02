const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const IdentityManagement = await hre.ethers.getContractFactory(
    "IdentityManagement"
  );

  // Deploy the contract
  const identityManagement = await IdentityManagement.deploy();

  // Wait for deployment to complete
  await identityManagement.waitForDeployment();

  // Get the deployed contract address
  const address = await identityManagement.getAddress();

  console.log("IdentityManagement deployed to:", address);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
