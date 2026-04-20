import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  /**
   * Triggers the hardhat verification script in the bc directory.
   */
  async verifyCampaign(
    campaignAddr: string,
    poolAddr: string,
    args: {
      name: string;
      description: string;
      imageHash: string;
      category: number;
      minimum: string;
      manager: string;
      registry: string;
    },
  ) {
    this.logger.log(`Starting verification process for campaign: ${campaignAddr}`);

    // Path to the blockchain directory (relative to this file's location in be/src/blockchain)
    const bcPath = path.resolve(__dirname, '../../../../bc');

    // Prepare environment variables for the hardhat script
    const env = {
      ...process.env,
      VERIFY_CAMPAIGN_ADDR: campaignAddr,
      VERIFY_POOL_ADDR: poolAddr,
      VERIFY_NAME: args.name,
      VERIFY_DESC: args.description,
      VERIFY_IMAGE_HASH: args.imageHash,
      VERIFY_CAT: args.category.toString(),
      VERIFY_MIN: args.minimum,
      VERIFY_MANAGER: args.manager,
      VERIFY_REGISTRY: args.registry,
    };

    try {
      // Execute the hardhat command
      // Note: We use 'npx hardhat run' to ensure the correct hardhat environment is used.
      const { stdout, stderr } = await execAsync(
        'npx hardhat run scripts/verify-campaign.ts --network sepolia',
        {
          cwd: bcPath,
          env,
        },
      );

      if (stdout) this.logger.log(`Verification Output: ${stdout}`);
      if (stderr) this.logger.error(`Verification Error Output: ${stderr}`);

      this.logger.log(`Verification task completed for ${campaignAddr}`);
    } catch (error) {
      this.logger.error(`Failed to execute verification script: ${error.message}`);
    }
  }
}
