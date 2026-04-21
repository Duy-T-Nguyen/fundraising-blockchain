import { Module } from '@nestjs/common';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    HttpModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: 'gas-optimization-queue',
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService, AiService],
  exports: [RelayerService, AiService],
})
export class RelayerModule {}
