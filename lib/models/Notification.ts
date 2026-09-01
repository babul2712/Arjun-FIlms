import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'payment' | 'shoot' | 'project' | 'quotation' | 'crew';

export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['payment', 'shoot', 'project', 'quotation', 'crew'], 
    default: 'payment' 
  },
  link: { type: String, default: '/dashboard' },
  read: { type: Boolean, default: false },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

delete mongoose.models.Notification;
export default (mongoose.models.Notification as any) || mongoose.model<INotification>('Notification', NotificationSchema);
