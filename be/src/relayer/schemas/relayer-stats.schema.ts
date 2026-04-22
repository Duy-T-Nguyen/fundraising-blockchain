import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RelayerStatsDocument = RelayerStats & Document;

@Schema({ timestamps: true })
export class RelayerStats {
  @Prop({ default: 'GLOBAL_STATS', unique: true })
  id: string;

  @Prop({ default: 0 })
  cumulativeSavings: number;

  @Prop({ default: 0 })
  totalIntentsProcessed: number;

  @Prop({ default: 0 })
  totalBatchesExecuted: number;

  @Prop({ type: [Number], default: [] })
  lastState: number[];

  @Prop({ default: 'WAIT' })
  lastDecision: string;
}

export const RelayerStatsSchema = SchemaFactory.createForClass(RelayerStats);
