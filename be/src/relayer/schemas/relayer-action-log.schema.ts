import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RelayerActionLogDocument = RelayerActionLog & Document;

@Schema({ timestamps: true })
export class RelayerActionLog {
  @Prop({ type: [Number], required: true })
  state: number[];

  @Prop({ required: true })
  decision: string;

  @Prop({ required: true })
  actionRatio: number;

  @Prop({ required: true })
  gasPrice: number;

  @Prop({ required: true })
  gasRef: number;

  @Prop({ default: 0 })
  savings: number;
}

export const RelayerActionLogSchema = SchemaFactory.createForClass(RelayerActionLog);
