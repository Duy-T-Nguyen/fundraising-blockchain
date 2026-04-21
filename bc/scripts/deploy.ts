import { ethers, run } from "hardhat";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Forwarder
  const Forwarder = await ethers.getContractFactory("Forwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("Forwarder deployed to:", forwarderAddress);

  // 2. Deploy SupplierRegistry (Platform Admin = deployer)
  const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
  const supplierRegistry = await SupplierRegistry.deploy(deployer.address, forwarderAddress);
  await supplierRegistry.waitForDeployment();
  const registryAddress = await supplierRegistry.getAddress();
  console.log("SupplierRegistry deployed to:", registryAddress);

  // 3. Deploy CampaignFactory (inject SupplierRegistry and set Admin)
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy(registryAddress, deployer.address, forwarderAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("CampaignFactory deployed to:", factoryAddress);

  console.log("\n--- Deployment Summary ---");
  console.log("Platform Admin:", deployer.address);
  console.log("Forwarder:", forwarderAddress);
  console.log("SupplierRegistry:", registryAddress);
  console.log("CampaignFactory:", factoryAddress);

  // --- Auto-Verification ---
  // We wait for about 30-60 seconds to ensure Etherscan has indexed the contracts
  console.log("\nWaiting for Etherscan indexing (60s)...");
  await delay(60000);

  console.log("Starting verification...");

  try {
    await run("verify:verify", {
      address: forwarderAddress,
      constructorArguments: [],
    });
    console.log("Forwarder verified!");
  } catch (e: any) {
    console.log("Forwarder verification failed:", e.message);
  }

  try {
    await run("verify:verify", {
      address: registryAddress,
      constructorArguments: [deployer.address, forwarderAddress],
    });
    console.log("SupplierRegistry verified!");
  } catch (e: any) {
    console.log("SupplierRegistry verification failed:", e.message);
  }

  try {
    await run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [registryAddress, deployer.address, forwarderAddress],
    });
    console.log("CampaignFactory verified!");
  } catch (e: any) {
    console.log("CampaignFactory verification failed:", e.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
