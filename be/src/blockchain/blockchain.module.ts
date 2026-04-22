import { Module } from '@nestjs/common';
import { BlockchainListenerService } from './blockchain-listener.service';
import { VerificationService } from './verification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { SyncState, SyncStateSchema } from './schemas/sync-state.schema';
import { GasHistory, GasHistorySchema } from './schemas/gas-history.schema';
import { GasMonitorService } from './gas-monitor.service';
import { SocketGateway } from './socket.gateway';

import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SyncState.name, schema: SyncStateSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: GasHistory.name, schema: GasHistorySchema },
    ])
  ],
  controllers: [NotificationsController],
  providers: [
    BlockchainListenerService, 
    VerificationService, 
    SocketGateway, 
    GasMonitorService
  ],
  exports: [
    VerificationService, 
    SocketGateway, 
    MongooseModule, 
    GasMonitorService
  ],
})
export class BlockchainModule {}
