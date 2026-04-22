import { Controller, Post, Body, Get, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import { RelayerService } from './relayer.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SubmitIntentDto } from './dto/submit-intent.dto';

@ApiTags('Relayer (Gas Optimization)')
@Controller('relayer')
export class RelayerController {
  private readonly logger = new Logger(RelayerController.name);
  constructor(private readonly relayerService: RelayerService) {}

  @Post('intent')
  @ApiOperation({ 
    summary: 'Gửi chữ ký giao dịch (Eco Mode)',
    description: 'Nhận chữ ký EIP-712 từ người dùng, xác thực và đưa vào hàng đợi để AI tối ưu hóa Gas.' 
  })
  @ApiBody({ type: SubmitIntentDto })
  @ApiResponse({ status: 201, description: 'Đã tiếp nhận yêu cầu và đưa vào hàng đợi.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu gửi lên không hợp lệ hoặc chữ ký sai.' })
  async submitIntent(@Body() submitIntentDto: SubmitIntentDto) {
    this.logger.log(`>>> Received Intent: ${JSON.stringify(submitIntentDto)}`);
    try {
      const result = await this.relayerService.submitIntent(submitIntentDto);
      this.logger.log(`<<< Intent processed: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`!!! Intent Error: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy trạng thái hàng đợi (Dành cho AI RL Agent)' })
  @ApiResponse({ status: 200, description: 'Trả về queueSize và oldestJobAge.' })
  async getStats() {
    return await this.relayerService.getQueueStats();
  }

  @Post('execute-batch')
  @ApiOperation({ summary: 'Lệnh thực thi gom mẻ (Chỉ dành cho AI RL Agent điều khiển)' })
  async executeBatch(@Body() body: { batchSize?: number }) {
    return await this.relayerService.processBatch(body.batchSize);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử quyết định của AI' })
  async getHistory() {
    return await this.relayerService.getHistory();
  }

  @Get('intents/:address')
  @ApiOperation({ summary: 'Lấy danh sách các Request ID đang chờ AI xử lý của một ví' })
  @ApiResponse({ status: 200, description: 'Mảng các Request ID đang pending' })
  async getPendingIntents(@Param('address') address: string) {
    return await this.relayerService.getPendingIntents(address);
  }
}
