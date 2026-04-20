import { Controller, Get, Query, Patch, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  @Get()
  async getNotifications(@Query('address') address: string) {
    if (!address) return [];
    return this.notificationModel
      .find({ address: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }
}
