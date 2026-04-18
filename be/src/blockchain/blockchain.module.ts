import { Module } from '@nestjs/common';
import { BlockchainListenerService } from './blockchain-listener.service';
import { VerificationService } from './verification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncState, SyncStateSchema } from './schemas/sync-state.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SyncState.name, schema: SyncStateSchema }])],
  providers: [BlockchainListenerService, VerificationService],
  exports: [VerificationService],
})
export class BlockchainModule {}
