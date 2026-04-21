import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private aiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const baseUrl = this.configService.get<string>('AI_SIDECAR_URL') || 'http://localhost:8000';
    this.aiUrl = `${baseUrl}/predict`;
  }

  /**
   * Gọi AI Sidecar để lấy quyết định hành động
   * @param state Vector trạng thái [s_gas, s_queue, s_deadline, ...]
   * @returns 0 (Đợi) hoặc 1-N (Gửi với priority tương ứng)
   */
  async getDecision(state: number[]): Promise<number> {
    try {
      this.logger.debug(`Calling AI with state: [${state.join(', ')}]`);
      
      const { data } = await firstValueFrom(
        this.httpService.post(this.aiUrl, { state })
      );

      return data.action;
    } catch (error) {
      this.logger.error(`AI Sidecar Error: ${error.message}`);
      // Fallback: Nếu AI lỗi, ta mặc định chọn hành động gửi ngay (Action 1) để an toàn
      return 1; 
    }
  }

  /**
   * Kiểm tra tình trạng sức khỏe của AI Sidecar
   */
  async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = this.configService.get<string>('AI_SIDECAR_URL') || 'http://localhost:8000';
      const { data } = await firstValueFrom(
        this.httpService.get(`${baseUrl}/health`)
      );
      return data.status === 'ready';
    } catch {
      return false;
    }
  }
}
