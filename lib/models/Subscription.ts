import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  clientName: string;
  businessType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  subscriptionPlan: string;
  monthlyFee: number;
  workingDaysPerWeek: number;
  totalMonthlyDays: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  status: 'Active' | 'Inactive' | 'Paused' | 'Cancelled';
  logoUrl: string;
  notes: string;
  colorTag: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    businessType: { type: String, default: 'Cafe' },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: { type: String, default: '' },
    ownerAddress: { type: String, default: '' },
    subscriptionPlan: { type: String, required: true },
    monthlyFee: { type: Number, required: true },
    workingDaysPerWeek: { type: Number, required: true },
    totalMonthlyDays: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    renewalDate: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Paused', 'Cancelled'],
      default: 'Active',
    },
    logoUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    colorTag: { type: String, default: '#e50914' },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Subscription;
export default (mongoose.models.Subscription as any) ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
