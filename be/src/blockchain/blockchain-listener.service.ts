import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { VerificationService } from './verification.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SyncState, SyncStateDocument } from './schemas/sync-state.schema';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private verificationService: VerificationService,
    private socketGateway: SocketGateway,
    @InjectModel(SyncState.name) private syncStateModel: Model<SyncStateDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
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
      'event CampaignStarted(address indexed campaignAddress, address indexed manager, string metadataCID, uint8 indexed category, uint256 minContribution)',
      'event CampaignRequestSubmitted(uint256 indexed requestId, address indexed manager, string metadataCID, uint8 category, uint256 minimum)',
      'function supplierRegistry() view returns (address)',
      'function deployedCampaigns(uint256) view returns (address)',
      'function getCampaigns(uint8, address, uint256, uint256, uint256) view returns (address[])'
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
          const [campaignAddress, manager, metadataCID, category, minContribution] = event.args;
          await this.handleCampaignStarted(campaignAddress, manager, metadataCID, category, minContribution);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch past events: ${error.message}`);
    }

    // 1. Lắng nghe yêu cầu tạo Campaign mới (Cho Admin)
    this.factoryContract.on('CampaignRequestSubmitted', async (requestId, manager, metadataCID) => {
      this.logger.log(`[Notification] New Campaign Request #${requestId} from ${manager}`);
      const adminAddress = this.configService.get<string>('ADMIN_ADDRESS');
      if (adminAddress) {
        await this.saveAndEmit(adminAddress, 'CAMPAIGN_SUBMITTED', ethers.ZeroAddress, Number(requestId), {
          description: `New Campaign Request from ${manager}`
        });
      }
    });

    // 2. Lắng nghe Campaign chính thức hoạt động (Cho Manager)
    this.factoryContract.on(
      'CampaignStarted',
      async (campaignAddress, manager, metadataCID, category, minContribution, event) => {
        this.logger.log(`[Notification] Campaign Approved at ${campaignAddress}`);
        await this.saveAndEmit(manager, 'CAMPAIGN_APPROVED', campaignAddress, 0, {
          description: `Your campaign has been approved and deployed!`
        });
        
        await this.handleCampaignStarted(campaignAddress, manager, metadataCID, category, minContribution);
        
        // Setup listener for this specific campaign's requests
        this.setupCampaignListener(campaignAddress);

        // Update DB
        const blockNumber = event.log.blockNumber;
        await this.syncStateModel.findOneAndUpdate(
          { id: stateId },
          { lastProcessedBlock: blockNumber },
          { upsert: true }
        );
      },
    );

    // Initial setup: Listen to all currently deployed campaigns
    this.setupExistingCampaignListeners();
  }

  private async setupExistingCampaignListeners() {
    try {
      // Use the existing getCampaigns function to fetch all (mode 0 = ALL)
      const campaigns = await this.factoryContract.getCampaigns(0, ethers.ZeroAddress, 0, 0, 1000);
      for (const addr of campaigns) {
        this.setupCampaignListener(addr);
      }
      this.logger.log(`Initialized listeners for ${campaigns.length} existing campaigns.`);
    } catch (error) {
      this.logger.warn(`Failed to setup existing campaign listeners: ${error.message}`);
    }
  }

  private setupCampaignListener(campaignAddress: string) {
    const campaignAbi = [
      'event RequestCreated(uint256 indexed requestId, string metadataCID, uint256 value, address recipient, address verifier, address[] selectedValidators, uint256 lastValidatorSelection)',
      'event FundsReleased(uint256 indexed requestId, address indexed recipient)',
      'event MilestoneReleased(uint256 indexed requestId, uint256 milestoneIndex, uint256 amount, address indexed recipient, string evidenceHash)',
      'event Donation(address indexed donor, uint256 amount)'
    ];
    const campaignContract = new ethers.Contract(campaignAddress, campaignAbi, this.provider);

    campaignContract.on('RequestCreated', async (requestId, metadataCID, value, recipient, verifier, selectedValidators, lastValidatorSelection) => {
      this.logger.log(`[Notification] New Request #${requestId} in Campaign ${campaignAddress}`);
      
      // Notify Validators
      if (selectedValidators) {
        for (const validatorAddress of selectedValidators) {
          await this.saveAndEmit(validatorAddress, 'VALIDATION_ASSIGNED', campaignAddress, Number(requestId), {
            description: "New validation assignment", value: value.toString(), lastValidatorSelection: Number(lastValidatorSelection)
          });
        }
      }

      // Notify Supplier
      await this.saveAndEmit(recipient, 'REQUEST_ASSIGNED_SUPPLIER', campaignAddress, Number(requestId), {
        description: "New order received", value: value.toString()
      });

      // Notify Verifier
      await this.saveAndEmit(verifier, 'REQUEST_ASSIGNED_VERIFIER', campaignAddress, Number(requestId), {
        description: "New verification task", value: value.toString()
      });
    });

    campaignContract.on('FundsReleased', async (requestId, recipient) => {
      this.logger.log(`[Notification] Funds released for Request #${requestId} to ${recipient}`);
      await this.saveAndEmit(recipient, 'FUNDS_RELEASED', campaignAddress, Number(requestId), {});
    });

    campaignContract.on('MilestoneReleased', async (requestId, milestoneIndex, amount, recipient) => {
      this.logger.log(`[Notification] Milestone #${milestoneIndex} released for Request #${requestId} to ${recipient}`);
      await this.saveAndEmit(recipient, 'MILESTONE_RELEASED', campaignAddress, Number(requestId), {
        value: amount.toString(),
        description: `Milestone #${milestoneIndex}`
      });
    });
  }

  private async handleCampaignStarted(campaignAddress: string, manager: string, metadataCID: string, category: number, minContribution: any) {
    this.logger.log(`New Campaign detected at ${campaignAddress}`);

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
              metadataCID,
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

  private async saveAndEmit(address: string, type: string, campaignAddress: string, requestId: number, data: any) {
    try {
      await this.notificationModel.findOneAndUpdate(
        { address: address.toLowerCase(), campaignAddress: campaignAddress.toLowerCase(), requestId, type },
        {
          address: address.toLowerCase(),
          type,
          campaignAddress: campaignAddress.toLowerCase(),
          requestId,
          description: data.description || '',
          value: data.value || '',
          isRead: false,
          lastValidatorSelection: data.lastValidatorSelection || 0,
        },
        { upsert: true }
      );

      this.socketGateway.sendToUser(address, 'NEW_NOTIFICATION', {
        type,
        campaignAddress,
        requestId,
        ...data
      });
    } catch (err) {
      this.logger.error(`Failed to save/emit notification for ${address}: ${err.message}`);
    }
  }
}
