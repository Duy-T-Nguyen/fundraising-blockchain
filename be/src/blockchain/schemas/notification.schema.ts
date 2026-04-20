import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  address: string; // Địa chỉ ví nhận thông báo (Validator/Manager/Verifier)

  @Prop({ required: true })
  type: string; // Ví dụ: 'VALIDATION_ASSIGNED', 'CAMPAIGN_APPROVED'

  @Prop({ required: true })
  campaignAddress: string;

  @Prop({ required: true })
  requestId: number;

  @Prop()
  description: string;

  @Prop()
  value: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  lastValidatorSelection: number; // Timestamp (seconds)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ address: 1, isRead: 1 }); // Tối ưu truy vấn cho FE
