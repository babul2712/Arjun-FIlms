import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceEntry extends Document {
  type: 'income' | 'expense' | 'budget' | 'investment';
  category: string;
  description: string;
  amount: number;
  budgetLimit?: number;
  date: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
}

const FinanceEntrySchema: Schema = new Schema({
  type: { 
    type: String, 
    enum: ['income', 'expense', 'budget', 'investment'], 
    required: true 
  },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  budgetLimit: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: 'UPI / QR' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.FinanceEntry;
export default (mongoose.models.FinanceEntry as any) || mongoose.model<IFinanceEntry>('FinanceEntry', FinanceEntrySchema);
