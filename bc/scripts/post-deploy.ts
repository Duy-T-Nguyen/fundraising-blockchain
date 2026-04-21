import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Running post-deploy setup with:", deployer.address);

  const FACTORY_ADDRESS = "0xc2BC51D10a0c1baEe743A7BC6DFfA13ac915bcFe";
  const REGISTRY_ADDRESS = "0x22e68c084B0580EA120a07BDdeDaecC35239bb83";

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
