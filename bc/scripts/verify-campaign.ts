import { run } from "hardhat";

/**
 * Utility function to verify a Campaign and its associated ValidatorPool.
 */
async function verifyCampaign(
  campaignAddress: string,
  poolAddress: string,
  args: {
    name: string;
    description: string;
    imageHash: string;
    category: number;
    minimum: string;
    manager: string;
    supplierRegistry: string;
  }
) {
  console.log(`\n--- Verifying Campaign at ${campaignAddress} ---`);

  // 1. Verify ValidatorPool
  try {
    console.log(`Verifying ValidatorPool at ${poolAddress}...`);
    await run("verify:verify", {
      address: poolAddress,
      constructorArguments: [args.manager],
    });
    console.log("ValidatorPool verified!");
  } catch (e: any) {
    if (e.message.includes("Already Verified")) {
      console.log("ValidatorPool is already verified.");
    } else {
      console.log("ValidatorPool verification failed:", e.message);
    }
  }

  // 2. Verify Campaign
  try {
    console.log(`Verifying Campaign at ${campaignAddress}...`);
    await run("verify:verify", {
      address: campaignAddress,
      constructorArguments: [
        args.name,
        args.description,
        args.imageHash,
        args.category,
        args.minimum,
        args.manager,
        poolAddress,
        args.supplierRegistry,
      ],
    });
    console.log("Campaign verified!");
  } catch (e: any) {
    if (e.message.includes("Already Verified")) {
      console.log("Campaign is already verified.");
    } else {
      console.log("Campaign verification failed:", e.message);
    }
  }
}

async function main() {
  // If run via CLI, parse arguments from environment variables for simplicity
  // This allows the Backend to easily pass complex data
  const {
    VERIFY_CAMPAIGN_ADDR,
    VERIFY_POOL_ADDR,
    VERIFY_NAME,
    VERIFY_DESC,
    VERIFY_IMAGE_HASH,
    VERIFY_CAT,
    VERIFY_MIN,
    VERIFY_MANAGER,
    VERIFY_REGISTRY,
  } = process.env;

  if (!VERIFY_CAMPAIGN_ADDR) {
    console.log("Skipping verification: No CAMPAIGN_ADDR provided in env.");
    return;
  }

  await verifyCampaign(VERIFY_CAMPAIGN_ADDR, VERIFY_POOL_ADDR!, {
    name: VERIFY_NAME!,
    description: VERIFY_DESC!,
    imageHash: VERIFY_IMAGE_HASH!,
    category: parseInt(VERIFY_CAT!),
    minimum: VERIFY_MIN!,
    manager: VERIFY_MANAGER!,
    supplierRegistry: VERIFY_REGISTRY!,
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { verifyCampaign };
