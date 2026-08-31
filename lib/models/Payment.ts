import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  customerId: string;
  customerName: string;
  phone: string;
  quotationId?: string;
  bookingId?: string;
  amount: number;
  paymentMethod: string;
  screenshotUrl: string;
  status: string;
  date: Date;
  remarks?: string;
  projectId?: string;
}

const PaymentSchema: Schema = new Schema({
  customerId: { type: String },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  quotationId: { type: String },
  bookingId: { type: String },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  screenshotUrl: { type: String },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
});

delete mongoose.models.Payment;
export default (mongoose.models.Payment as any) || mongoose.model<IPayment>('Payment', PaymentSchema);
