import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPayment extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  clientName: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: Date;
  dueDate?: Date;
  transactionId?: string;
  invoiceNumber: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPaymentSchema: Schema = new Schema(
  {
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    clientName: { type: String, required: true },
    month: { type: String, required: true }, // e.g. "November 2026"
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    paidDate: { type: Date },
    dueDate: { type: Date },
    transactionId: { type: String, default: '' },
    invoiceNumber: { type: String, required: true },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

delete (mongoose.models as any).SubscriptionPayment;
export default (mongoose.models.SubscriptionPayment as any) ||
  mongoose.model<ISubscriptionPayment>(
    'SubscriptionPayment',
    SubscriptionPaymentSchema
  );
