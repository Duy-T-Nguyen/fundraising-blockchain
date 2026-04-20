import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Running post-deploy setup with:", deployer.address);

  const FACTORY_ADDRESS = "0x9FCc4133983903EdADB61D592450079c2185d750";
  const REGISTRY_ADDRESS = "0xA3531Cfaa721604a4cf85D93402f5985fa7e1CC3";

  // 1. Link Factory to SupplierRegistry
  const registry = await ethers.getContractAt("SupplierRegistry", REGISTRY_ADDRESS);
  console.log("Setting Factory on SupplierRegistry...");
  const tx = await registry.setFactory(FACTORY_ADDRESS);
  await tx.wait();
  console.log("✅ Factory linked to SupplierRegistry");

  console.log("\n--- Post-Deploy Summary ---");
  console.log("SupplierRegistry:", REGISTRY_ADDRESS);
  console.log("CampaignFactory:", FACTORY_ADDRESS);
  console.log("Platform Admin:", deployer.address);
  console.log("Factory linked: ✅");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
