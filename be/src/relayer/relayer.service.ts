import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ethers } from 'ethers';
import { SubmitIntentDto } from './dto/submit-intent.dto';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AiService } from './ai.service';
import { GasMonitorService } from '../blockchain/gas-monitor.service';
import { SocketGateway } from '../blockchain/socket.gateway';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RelayerStats, RelayerStatsDocument } from './schemas/relayer-stats.schema';
import { RelayerActionLog, RelayerActionLogDocument } from './schemas/relayer-action-log.schema';

@Injectable()
export class RelayerService implements OnModuleInit {
  private readonly logger = new Logger(RelayerService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private forwarderContract: ethers.Contract;
  
  // Chỉ số hiệu quả AI (State managed in DB, cached in memory)
  private cumulativeSavings: number = 0; // ETH
  private lastDecision: string = 'WAIT';
  private lastActionRatio: number = 0;
  private lastState: number[] = [];

  constructor(
    @InjectQueue('gas-optimization-queue') private gasQueue: Queue,
    private configService: ConfigService,
    private aiService: AiService,
    private gasMonitor: GasMonitorService,
    private socketGateway: SocketGateway,
    @InjectModel(RelayerStats.name) private statsModel: Model<RelayerStatsDocument>,
    @InjectModel(RelayerActionLog.name) private actionLogModel: Model<RelayerActionLogDocument>,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL') || 'http://localhost:8545';
    const privateKey = this.configService.get<string>('RELAYER_PRIVATE_KEY');
    const forwarderAddress = this.configService.get<string>('FORWARDER_ADDRESS');

    if (privateKey && forwarderAddress) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      const abi = [
        {
          "inputs": [
            {
              "components": [
                { "internalType": "address", "name": "from", "type": "address" },
                { "internalType": "address", "name": "to", "type": "address" },
                { "internalType": "uint256", "name": "value", "type": "uint256" },
                { "internalType": "uint256", "name": "gas", "type": "uint256" },
                { "internalType": "uint256", "name": "nonce", "type": "uint256" },
                { "internalType": "bytes", "name": "data", "type": "bytes" }
              ],
              "internalType": "struct Forwarder.ForwardRequest",
              "name": "req",
              "type": "tuple"
            },
            { "internalType": "bytes", "name": "signature", "type": "bytes" }
          ],
          "name": "execute",
          "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" },
            { "internalType": "bytes", "name": "", "type": "bytes" }
          ],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "components": [
                { "internalType": "address", "name": "from", "type": "address" },
                { "internalType": "address", "name": "to", "type": "address" },
                { "internalType": "uint256", "name": "value", "type": "uint256" },
                { "internalType": "uint256", "name": "gas", "type": "uint256" },
                { "internalType": "uint256", "name": "nonce", "type": "uint256" },
                { "internalType": "bytes", "name": "data", "type": "bytes" }
              ],
              "internalType": "struct Forwarder.ForwardRequest[]",
              "name": "reqs",
              "type": "tuple[]"
            },
            { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
          ],
          "name": "executeBatch",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [{ "internalType": "address", "name": "from", "type": "address" }],
          "name": "getNonce",
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      this.forwarderContract = new ethers.Contract(forwarderAddress, abi, this.wallet);
      this.logger.log(`Relayer Service initialized with wallet: ${this.wallet.address}`);
    }

    // Load persistent stats from DB
    await this.loadStats();
  }

  private async loadStats() {
    try {
      let stats = await this.statsModel.findOne({ id: 'GLOBAL_STATS' });
      if (!stats) {
        stats = await this.statsModel.create({ id: 'GLOBAL_STATS' });
      }
      this.cumulativeSavings = stats.cumulativeSavings;
      this.lastDecision = stats.lastDecision;
      this.lastState = stats.lastState;
      this.logger.log(`Loaded persistent stats: Savings=${this.cumulativeSavings} ETH`);
    } catch (error) {
      this.logger.error(`Failed to load stats from DB: ${error.message}`);
    }
  }

  private async saveStats() {
    try {
      await this.statsModel.updateOne(
        { id: 'GLOBAL_STATS' },
        {
          cumulativeSavings: this.cumulativeSavings,
          lastDecision: this.lastDecision,
          lastState: this.lastState,
          lastActionRatio: this.lastActionRatio,
        },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Failed to save stats to DB: ${error.message}`);
    }
  }

  /**
   * Vòng lặp quyết định của AI - Chạy mỗi 12 giây (Khớp với Sepolia Block Time)
   */
  @Cron('*/12 * * * * *')
  async handleAiOptimization() {
    try {
      this.logger.debug('--- AI Gas Optimization Cycle ---');
      
      // 1. Kiểm tra hàng đợi
      const stats = await this.getQueueStats();
      if (stats.queueSize === 0) {
        return;
      }

      // 2. Lấy 11 thôgn số trạng thái từ thị trường và hàng đợi
      // s_time_left = Thời gian còn lại cho đến deadline (Giảm xuống 5 phút để AI quyết đoán hơn trong demo)
      const MAX_WAIT_HOURS = 0.0833; // 5 minutes 
      const ageHours = stats.oldestJobAge / 3600;
      const timeLeftHours = Math.max(0, MAX_WAIT_HOURS - ageHours);
      
      const state = await this.gasMonitor.getCurrentState(
        stats.queueSize,
        timeLeftHours
      );

      // 3. Hỏi ý kiến AI Sidecar
      const action = await this.aiService.getDecision(state);
      this.lastState = state;

      // 4. Thực thi hành động dựa trên Tỷ lệ % (Action Ratio)
      const actionBins = [0.0, 0.25, 0.5, 0.75, 1.0]; 
      const ratio = actionBins[action] !== undefined ? actionBins[action] : 0;
      this.lastActionRatio = ratio;

      if (ratio === 0) {
        this.lastDecision = 'WAIT';
        this.logger.log(`AI Decision: [WAIT] (Queue: ${stats.queueSize}, Gas is high/unstable)`);
      } else {
        this.lastDecision = 'EXECUTE';
        const dynamicBatchSize = Math.max(1, Math.floor(ratio * stats.queueSize));
        this.logger.log(`AI Decision: [EXECUTE] (Ratio: ${ratio * 100}%). Sending ${dynamicBatchSize} transactions...`);
        
        // Tính toán tiết kiệm giả lập (Mock savings calculation)
        // Tiết kiệm được = (Gas tham chiếu - Gas hiện tại) * 21000 * số lượng
        const gasDiff = state[10] - state[0]; // s_gas_ref - s_gas_t0
        if (gasDiff > 0) {
          const savings = (gasDiff * 21000 * dynamicBatchSize) / 1e18; // Chuyển sang ETH
          this.cumulativeSavings += savings;
        }

        await this.processBatch(dynamicBatchSize);
      }
      
      // Save to Action Log for history
      await this.actionLogModel.create({
        state,
        decision: this.lastDecision,
        actionRatio: ratio,
        gasPrice: state[0],
        gasRef: state[10],
        savings: 0 // Will be updated if we calculate accurately per batch
      });

      // Notify stats update after AI decision
      await this.notifyStatsChange();
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
      
      // Notify via Socket.io
      await this.notifyStatsChange();

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
      const req = job.data.forwardRequest;
      requests.push({
        from: req.from,
        to: req.to,
        value: BigInt(req.value),
        gas: BigInt(req.gas),
        nonce: BigInt(req.nonce),
        data: req.data
      });
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

      // Track batch metrics in DB
      await this.statsModel.updateOne(
        { id: 'GLOBAL_STATS' },
        { 
          $inc: { 
            totalBatchesExecuted: 1,
            totalIntentsProcessed: jobs.length 
          } 
        }
      );

      // Notify via Socket.io
      await this.notifyStatsChange();

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
      cumulativeSavings: this.cumulativeSavings,
      lastDecision: this.lastDecision,
      lastActionRatio: this.lastActionRatio,
      lastState: this.lastState,
      timestamp: Date.now()
    };
  }

  async getHistory(limit: number = 50) {
    return this.actionLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  private verifyEIP712(forwardRequest: any, signature: string): string {
    const chainId = this.configService.get<number>('CHAIN_ID') || 31337;
    const domain = {
      name: 'FundraisingForwarder',
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

  /**
   * Phát sóng thô thôgn số hàng đợi mới nhất cho toàn bộ client qua Socket.io
   */
  private async notifyStatsChange() {
    try {
      // Persist to DB before broadcasting
      await this.saveStats();
      
      const stats = await this.getQueueStats();
      this.socketGateway.broadcast('relayer-stats', stats);
    } catch (error) {
      this.logger.error(`Error broadcasting stats: ${error.message}`);
    }
  }
}
