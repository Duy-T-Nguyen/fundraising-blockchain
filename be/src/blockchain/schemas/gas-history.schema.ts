import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  collection: 'gas_history', 
  timeseries: { 
    timeField: 'timestamp', 
    metaField: 'network', 
    granularity: 'seconds' 
  } 
})
export class GasHistory extends Document {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  network: string;

  @Prop({ required: true, unique: true, index: true })
  blockNumber: number;

  @Prop({ required: true })
  baseFee: number; // Đơn vị Gwei

  @Prop({ required: true })
  gasUsed: number;

  @Prop({ required: true })
  gasLimit: number;

  @Prop({ required: true })
  txCount: number;
}

export const GasHistorySchema = SchemaFactory.createForClass(GasHistory);
