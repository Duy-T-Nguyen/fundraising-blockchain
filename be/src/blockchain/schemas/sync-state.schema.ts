import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SyncStateDocument = SyncState & Document;

@Schema({ collection: 'sync_states' })
export class SyncState {
  @Prop({ required: true, unique: true })
  id: string; // Identifier for the sync state, e.g., 'campaignFactoryListener'

  @Prop({ required: true })
  lastProcessedBlock: number;
}

export const SyncStateSchema = SchemaFactory.createForClass(SyncState);
