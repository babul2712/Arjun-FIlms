import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionShoot extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  clientName: string;
  scheduledDate: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  completedAt?: Date;
  cancelledAt?: Date;
  rescheduledTo?: Date;
  deliverables?: string;
  notes?: string;
  shootType?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionShootSchema: Schema = new Schema(
  {
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    clientName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    rescheduledTo: { type: Date },
    deliverables: { type: String, default: '' },
    notes: { type: String, default: '' },
    shootType: { type: String, default: 'Photography & Videography' },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

delete (mongoose.models as any).SubscriptionShoot;
export default (mongoose.models.SubscriptionShoot as any) ||
  mongoose.model<ISubscriptionShoot>('SubscriptionShoot', SubscriptionShootSchema);
