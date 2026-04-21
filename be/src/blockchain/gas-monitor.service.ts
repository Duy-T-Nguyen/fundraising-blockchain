import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers } from 'ethers';
import { GasHistory } from './schemas/gas-history.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GasMonitorService implements OnModuleInit {
  private readonly logger = new Logger(GasMonitorService.name);
  private provider: ethers.JsonRpcProvider;
  private prevBacklog = 0; // Lưu giá trị backlog từ block trước (b_t-1)

  constructor(
    @InjectModel(GasHistory.name) private gasHistoryModel: Model<GasHistory>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://rpc.ankr.com/eth_sepolia';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    this.provider.on('block', async (blockNumber) => {
      try {
        await this.recordBlock(blockNumber);
      } catch (error) {
        this.logger.error(`Failed to record block ${blockNumber}: ${error.message}`);
      }
    });

    // Thực hiện nạp dữ liệu lịch sử ngay khi khởi động
    await this.preloadHistory();
    this.logger.log('GasMonitorService initialized and ready.');
  }

  /**
   * Quét ngược quá khứ để nạp đủ 128 block cho AI
   */
  private async preloadHistory() {
    this.logger.log('Đang kiểm tra dữ liệu lịch sử cho AI...');
    
    const count = await this.gasHistoryModel.countDocuments();
    if (count >= 128) {
      this.logger.log(`Đã có đủ ${count} block trong DB. Sẵn sàng.`);
      return;
    }

    const currentBlock = await this.provider.getBlockNumber();
    const needed = 128 - count;
    this.logger.log(`Đang nạp thêm ${needed} block lịch sử từ Blockchain...`);

    // Nạp theo lô (Batch) 10 block một lần cho nhanh
    const batchSize = 10;
    for (let i = 0; i < needed; i += batchSize) {
      // CORTEX_FIX_APPLIED: Explicitly type promises array to avoid TS(2345)
      const promises: Promise<any>[] = [];
      for (let j = 0; j < batchSize && (i + j) < needed; j++) {
        const targetBlock = currentBlock - (count + i + j + 1);
        promises.push(this.recordBlock(targetBlock));
      }
      await Promise.all(promises);
      this.logger.log(`... Đã nạp được ${i + promises.length + count}/128 blocks`);
    }

    this.logger.log('Hoàn tất nạp dữ liệu. AI đã đủ "tầm nhìn" hoạt động.');
  }

  private async recordBlock(blockNumber: number) {
    // Tránh lưu trùng block
    const exists = await this.gasHistoryModel.exists({ blockNumber });
    if (exists) return;

    const block = await this.provider.getBlock(blockNumber);
    if (!block || block.baseFeePerGas === null) return;

    await this.gasHistoryModel.create({
      timestamp: new Date(Number(block.timestamp) * 1000),
      network: 'sepolia',
      blockNumber: Number(block.number),
      baseFee: Number(block.baseFeePerGas),
      gasUsed: Number(block.gasUsed),
      gasLimit: Number(block.gasLimit),
      txCount: block.transactions.length,
    });
  }

  /**
   * Tính toán 11 thôgn số trạng thái (State) cho AI
   */
  async getCurrentState(queueSize: number, timeLeftHours: number): Promise<number[]> {
    const history = await this.gasHistoryModel
      .find()
      .sort({ timestamp: -1 })
      .limit(128)
      .exec();

    if (history.length < 3) {
      throw new Error('Chưa đủ dữ liệu lịch sử để tính toán State (Cần tối thiểu 3 block).');
    }

    const t0 = history[0];
    const t1 = history[1];
    const t2 = history[2];

    const s_gas_t0 = t0.baseFee;
    const s_gas_t1 = t1.baseFee;
    const s_gas_t2 = t2.baseFee;

    const targetGas = t0.gasLimit / 2.0;
    const s_congestion = (t0.gasUsed - targetGas) / targetGas;

    const s_momentum = Math.log(s_gas_t0 / s_gas_t1);
    const momentum_t1 = Math.log(s_gas_t1 / s_gas_t2);
    const s_accel = s_momentum - momentum_t1;

    const window128 = history.map(h => h.txCount);
    const mean128 = window128.reduce((a, b) => a + b, 0) / window128.length;
    const std128 = Math.sqrt(window128.map(x => Math.pow(x - mean128, 2)).reduce((a, b) => a + b, 0) / window128.length) || 1.0;
    const s_surprise = (t0.txCount - mean128) / std128;

    const s_backlog = Math.max(0.0, 0.95 * this.prevBacklog + 0.3 * s_congestion + 0.2 * s_surprise);
    this.prevBacklog = s_backlog;

    const s_queue = queueSize;
    const s_time_left = timeLeftHours;
    const s_gas_ref = history.reduce((acc, curr) => acc + curr.baseFee, 0) / history.length;

    const rawState = [
      s_gas_t0, s_gas_t1, s_gas_t2,
      s_congestion, s_momentum, s_accel,
      s_surprise, s_backlog,
      s_queue, s_time_left, s_gas_ref
    ];

    return rawState;
  }
}
