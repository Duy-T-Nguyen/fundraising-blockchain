import { Module } from '@nestjs/common';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gas-optimization-queue',
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService],
  exports: [RelayerService],
})
export class RelayerModule {}
