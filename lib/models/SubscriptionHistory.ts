import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionHistory extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  clientName: string;
  changedAt: Date;
  changedBy: string;
  changes: {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
  }[];
  notes?: string;
  createdAt: Date;
}

const SubscriptionHistorySchema: Schema = new Schema(
  {
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    clientName: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'Admin' },
    changes: [
      {
        field: { type: String },
        label: { type: String },
        oldValue: { type: String },
        newValue: { type: String },
      },
    ],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

delete (mongoose.models as any).SubscriptionHistory;
export default (mongoose.models.SubscriptionHistory as any) ||
  mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema);
