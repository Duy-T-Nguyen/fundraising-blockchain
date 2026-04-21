import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ethers } from 'ethers';
import { SubmitIntentDto } from './dto/submit-intent.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RelayerService implements OnModuleInit {
  private readonly logger = new Logger(RelayerService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private forwarderContract: ethers.Contract;

  constructor(
    @InjectQueue('gas-optimization-queue') private gasQueue: Queue,
    private configService: ConfigService,
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

      this.logger.log(`Intent submitted successfully. Job ID: ${job.id}`);
      return { success: true, jobId: job.id };
    } catch (error) {
      this.logger.error(`Failed to submit intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy thống kê hàng đợi để cung cấp "State" cho mô hình RL
   */
  /**
   * Thực thi gom mẻ nhiều giao dịch (Chế độ Eco - AI điều khiển)
   * @param batchSize Số lượng giao dịch muốn gom
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
        // Sắp xếp lấy job cũ nhất
        const oldestJob = jobs.reduce((prev, curr) => (prev.timestamp < curr.timestamp ? prev : curr));
        oldestJobAge = Math.floor((Date.now() - oldestJob.timestamp) / 1000); // Đổi ra giây
    }

    return {
      queueSize,
      oldestJobAge,
      timestamp: Date.now()
    };
  }

  private verifyEIP712(forwardRequest: any, signature: string): string {
    // Định nghĩa kiểu dữ liệu EIP-712 (Phải khớp 100% với Forwarder.sol)
    const domain = {
      name: 'EcoFundForwarder',
      version: '1',
      chainId: 31337, // Hardhat Localhost (Cần chỉnh lại nếu dùng mạng khác)
      verifyingContract: forwardRequest.to, // Thường là Forwarder Address, nhưng tùy cách bạn ký
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

    // Sử dụng ethers v6 để verify
    return ethers.verifyTypedData(domain, types, forwardRequest, signature);
  }
}
