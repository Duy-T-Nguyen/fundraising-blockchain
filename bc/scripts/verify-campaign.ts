import { run } from "hardhat";

/**
 * Utility function to verify a Campaign.
 */
async function verifyCampaign(
  campaignAddress: string,
  args: {
    metadataCID: string;
    category: number;
    minimum: string;
    manager: string;
    supplierRegistry: string;
    forwarder: string;
  }
) {
  console.log(`\n--- Verifying Campaign at ${campaignAddress} ---`);

  // Verify Campaign
  try {
    console.log(`Verifying Campaign at ${campaignAddress}...`);
    await run("verify:verify", {
      address: campaignAddress,
      constructorArguments: [
        args.metadataCID,
        args.category,
        args.minimum,
        args.manager,
        args.supplierRegistry,
        args.forwarder,
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
  const {
    VERIFY_CAMPAIGN_ADDR,
    VERIFY_METADATA_CID,
    VERIFY_CAT,
    VERIFY_MIN,
    VERIFY_MANAGER,
    VERIFY_REGISTRY,
    VERIFY_FORWARDER,
  } = process.env;

  if (!VERIFY_CAMPAIGN_ADDR) {
    console.log("Skipping verification: No CAMPAIGN_ADDR provided in env.");
    return;
  }

  await verifyCampaign(VERIFY_CAMPAIGN_ADDR, {
    metadataCID: VERIFY_METADATA_CID!,
    category: parseInt(VERIFY_CAT!),
    minimum: VERIFY_MIN!,
    manager: VERIFY_MANAGER!,
    supplierRegistry: VERIFY_REGISTRY!,
    forwarder: VERIFY_FORWARDER!,
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { verifyCampaign };
