import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { VerificationService } from './verification.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SyncState, SyncStateDocument } from './schemas/sync-state.schema';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private verificationService: VerificationService,
    @InjectModel(SyncState.name) private syncStateModel: Model<SyncStateDocument>,
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

    // Get last processed block from DB
    const stateId = 'campaignFactoryListener';
    let syncState = await this.syncStateModel.findOne({ id: stateId });
    let lastBlock = syncState ? syncState.lastProcessedBlock : await this.provider.getBlockNumber();

    this.logger.log(`Starting to listen for CampaignStarted from block ${lastBlock}...`);

    // Fetch missed events
    try {
      const missedEvents = await this.factoryContract.queryFilter('CampaignStarted', lastBlock, 'latest');
      for (const event of missedEvents) {
        if ('args' in event) {
          const [campaignAddress, manager, name, description, imageHash, category, minContribution] = event.args;
          await this.handleCampaignStarted(campaignAddress, manager, name, description, imageHash, category, minContribution);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch past events: ${error.message}`);
    }

    // Listen for new events
    this.factoryContract.on(
      'CampaignStarted',
      async (campaignAddress, manager, name, description, imageHash, category, minContribution, event) => {
        await this.handleCampaignStarted(campaignAddress, manager, name, description, imageHash, category, minContribution);
        
        // Update DB
        const blockNumber = event.log.blockNumber;
        await this.syncStateModel.findOneAndUpdate(
          { id: stateId },
          { lastProcessedBlock: blockNumber },
          { upsert: true }
        );
      },
    );
  }

  private async handleCampaignStarted(campaignAddress: string, manager: string, name: string, description: string, imageHash: string, category: number, minContribution: any) {
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
  }
}
