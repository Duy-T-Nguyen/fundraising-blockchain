import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { VerificationService } from './verification.service';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private verificationService: VerificationService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const factoryAddress = this.configService.get<string>('CAMPAIGN_FACTORY_ADDRESS');

    if (!rpcUrl || !factoryAddress) {
      this.logger.warn('Blockchain listener not started: RPC_URL or CAMPAIGN_FACTORY_ADDRESS missing in .env');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Relevant part of the ABI
    const abi = [
      'event CampaignStarted(address indexed campaignAddress, address indexed manager, string campaignName, string description, string imageHash, uint8 indexed category, uint256 minContribution)',
      'function supplierRegistry() view returns (address)',
    ];

    this.factoryContract = new ethers.Contract(factoryAddress, abi, this.provider);

    this.logger.log(`Listening for CampaignStarted events on ${factoryAddress}...`);

    this.factoryContract.on(
      'CampaignStarted',
      async (campaignAddress, manager, name, description, imageHash, category, minContribution) => {
        this.logger.log(`New Campaign detected: ${name} at ${campaignAddress}`);

        // Wait for Etherscan to index (60 seconds)
        this.logger.log(`Waiting 60s before triggering verification for ${campaignAddress}...`);
        
        setTimeout(async () => {
          try {
            // Get pool address from the campaign contract
            const campaignContract = new ethers.Contract(
              campaignAddress,
              ['function validatorPool() view returns (address)'],
              this.provider,
            );
            const poolAddress = await campaignContract.validatorPool();
            const registryAddress = await this.factoryContract.supplierRegistry();

            await this.verificationService.verifyCampaign(campaignAddress, poolAddress, {
              name,
              description,
              imageHash,
              category,
              minimum: minContribution.toString(),
              manager,
              registry: registryAddress,
            });
          } catch (error) {
            this.logger.error(`Error during auto-verification trigger: ${error.message}`);
          }
        }, 60000);
      },
    );
  }
}
