import { Module } from '@nestjs/common';
import { BlockchainListenerService } from './blockchain-listener.service';
import { VerificationService } from './verification.service';

@Module({
  providers: [BlockchainListenerService, VerificationService],
  exports: [VerificationService],
})
export class BlockchainModule {}
