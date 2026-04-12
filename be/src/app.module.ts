import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvidenceModule } from './evidence/evidence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EvidenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
