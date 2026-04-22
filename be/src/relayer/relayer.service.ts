import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ethers } from 'ethers';
import { SubmitIntentDto } from './dto/submit-intent.dto';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AiService } from './ai.service';
import { GasMonitorService } from '../blockchain/gas-monitor.service';

@Injectable()
export class RelayerService implements OnModuleInit {
  private readonly logger = new Logger(RelayerService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private forwarderContract: ethers.Contract;

  constructor(
    @InjectQueue('gas-optimization-queue') private gasQueue: Queue,
    private configService: ConfigService,
    private aiService: AiService,
    private gasMonitor: GasMonitorService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL') || 'http://localhost:8545';
    const privateKey = this.configService.get<string>('RELAYER_PRIVATE_KEY');
    const forwarderAddress = this.configService.get<string>('FORWARDER_ADDRESS');

    if (privateKey && forwarderAddress) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      const abi = [
        "function execute((address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data), bytes signature) public payable returns (bool, bytes)",
        "function executeBatch((address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data)[], bytes[]) public payable",
        "function getNonce(address from) public view returns (uint256)"
      ];

      this.forwarderContract = new ethers.Contract(forwarderAddress, abi, this.wallet);
      this.logger.log(`Relayer Service initialized with wallet: ${this.wallet.address}`);
    }
  }

  /**
   * Vòng lặp quyết định của AI - Chạy mỗi 30 giây
   */
  @Cron('*/30 * * * * *')
  async handleAiOptimization() {
    try {
      this.logger.debug('--- AI Gas Optimization Cycle ---');
      
      // 1. Kiểm tra hàng đợi
      const stats = await this.getQueueStats();
      if (stats.queueSize === 0) {
        return;
      }

      // 2. Lấy 11 thôgn số trạng thái từ thị trường và hàng đợi
      // s_time_left = Thời gian còn lại cho đến deadline (mặc định deadline là 24h)
      const MAX_WAIT_HOURS = 24; 
      const ageHours = stats.oldestJobAge / 3600;
      const timeLeftHours = Math.max(0, MAX_WAIT_HOURS - ageHours);
      
      const state = await this.gasMonitor.getCurrentState(
        stats.queueSize,
        timeLeftHours
      );

      // 3. Hỏi ý kiến AI Sidecar
      const action = await this.aiService.getDecision(state);

      // 4. Thực thi hành động dựa trên Tỷ lệ % (Action Ratio)
      // Khớp 100% với config.py: (0.0, 0.25, 0.5, 0.75, 1.0)
      const actionBins = [0.0, 0.25, 0.5, 0.75, 1.0]; 
      const ratio = actionBins[action] !== undefined ? actionBins[action] : 0;

      if (ratio === 0) {
        this.logger.log(`AI Decision: [WAIT] (Queue: ${stats.queueSize}, Gas is high/unstable)`);
      } else {
        const dynamicBatchSize = Math.max(1, Math.floor(ratio * stats.queueSize));
        this.logger.log(`AI Decision: [EXECUTE] (Ratio: ${ratio * 100}%). Sending ${dynamicBatchSize} transactions...`);
        await this.processBatch(dynamicBatchSize);
      }
    } catch (error) {
      this.logger.error(`Error in AI Optimization cycle: ${error.message}`);
    }
  }

  /**
   * Xác thực chữ ký EIP-712 và đưa vào hàng đợi
   */
  async submitIntent(submitIntentDto: SubmitIntentDto) {
    try {
      const { forwardRequest, signature } = submitIntentDto;

      // 1. Verify EIP-712 Signature
      const recoveredAddress = this.verifyEIP712(forwardRequest, signature);
      
      if (recoveredAddress.toLowerCase() !== forwardRequest.from.toLowerCase()) {
        throw new Error('Chữ ký không hợp lệ: Người ký không khớp với trường "from"');
      }

      // 2. Đưa vào hàng đợi BullMQ
      const job = await this.gasQueue.add('execute-intent', {
        forwardRequest,
        signature,
        timestamp: Date.now(),
      });

      this.logger.log(`[Queue] Intent added to BullMQ. Job ID: ${job.id} | From: ${recoveredAddress}`);
      return { 
        success: true, 
        jobId: job.id,
        recoveredAddress,
        status: 'queued'
      };
    } catch (error) {
      this.logger.error(`Failed to submit intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Thực thi gom mẻ nhiều giao dịch (Chế độ Eco - AI điều khiển)
   */
  async processBatch(batchSize: number = 10) {
    const jobs = await this.gasQueue.getJobs(['waiting'], 0, batchSize - 1);
    
    if (jobs.length === 0) return { message: 'Hàng đợi trống' };

    this.logger.log(`Đang thực thi Batch cho ${jobs.length} giao dịch...`);

    const requests: any[] = [];
    const signatures: any[] = [];

    for (const job of jobs) {
      requests.push(job.data.forwardRequest);
      signatures.push(job.data.signature);
    }

    try {
      if (!this.forwarderContract) {
        throw new Error('Forwarder contract chưa được khởi tạo. Kiểm tra .env');
      }

      const tx = await this.forwarderContract.executeBatch(requests, signatures);
      const receipt = await tx.wait();

      // Sau khi thành công, xóa các job đã xử lý khỏi hàng đợi
      for (const job of jobs) {
        await job.remove();
      }

      this.logger.log(`Batch execution successful. Hash: ${tx.hash}`);
      return { success: true, txHash: tx.hash, count: jobs.length };
    } catch (error) {
      this.logger.error(`Lỗi thực thi Batch: ${error.message}`);
      throw error;
    }
  }

  async getQueueStats() {
    const queueSize = await this.gasQueue.count();
    const jobs = await this.gasQueue.getJobs(['waiting', 'delayed']);
    
    let oldestJobAge = 0;
    if (jobs.length > 0) {
        const oldestJob = jobs.reduce((prev, curr) => (prev.timestamp < curr.timestamp ? prev : curr));
        oldestJobAge = Math.floor((Date.now() - oldestJob.timestamp) / 1000); // Giây
    }

    return {
      queueSize,
      oldestJobAge,
      timestamp: Date.now()
    };
  }

  private verifyEIP712(forwardRequest: any, signature: string): string {
    const chainId = this.configService.get<number>('CHAIN_ID') || 31337;
    const domain = {
      name: 'EcoFundForwarder',
      version: '1',
      chainId: Number(chainId),
      verifyingContract: this.configService.get<string>('FORWARDER_ADDRESS'),
    };

    const types = {
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ],
    };

    return ethers.verifyTypedData(domain, types, forwardRequest, signature);
  }
}
