import { Module } from '@nestjs/common';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

import { MongooseModule } from '@nestjs/mongoose';
import { RelayerStats, RelayerStatsSchema } from './schemas/relayer-stats.schema';
import { RelayerActionLog, RelayerActionLogSchema } from './schemas/relayer-action-log.schema';

@Module({
  imports: [
    HttpModule,
    BlockchainModule,
    MongooseModule.forFeature([
      { name: RelayerStats.name, schema: RelayerStatsSchema },
      { name: RelayerActionLog.name, schema: RelayerActionLogSchema },
    ]),
    BullModule.registerQueue({
      name: 'gas-optimization-queue',
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService, AiService],
  exports: [RelayerService, AiService],
})
export class RelayerModule {}
