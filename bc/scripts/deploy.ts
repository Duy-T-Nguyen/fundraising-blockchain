import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy SupplierRegistry (Platform Admin = deployer)
  const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
  const supplierRegistry = await SupplierRegistry.deploy(deployer.address);
  await supplierRegistry.waitForDeployment();
  const registryAddress = await supplierRegistry.getAddress();
  console.log("SupplierRegistry deployed to:", registryAddress);

  // 2. Deploy CampaignFactory (inject SupplierRegistry)
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy(registryAddress);
  await factory.waitForDeployment();
  console.log("CampaignFactory deployed to:", await factory.getAddress());

  console.log("\n--- Deployment Summary ---");
  console.log("Platform Admin (SupplierRegistry):", deployer.address);
  console.log("SupplierRegistry:", registryAddress);
  console.log("CampaignFactory:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
