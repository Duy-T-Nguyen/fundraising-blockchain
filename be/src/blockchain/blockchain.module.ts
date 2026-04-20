import { Module } from '@nestjs/common';
import { BlockchainListenerService } from './blockchain-listener.service';
import { VerificationService } from './verification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { SyncState, SyncStateSchema } from './schemas/sync-state.schema';
import { SocketGateway } from './socket.gateway';

import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SyncState.name, schema: SyncStateSchema },
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  controllers: [NotificationsController],
  providers: [BlockchainListenerService, VerificationService, SocketGateway],
  exports: [VerificationService, SocketGateway],
})
export class BlockchainModule {}
