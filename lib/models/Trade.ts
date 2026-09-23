import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrade extends Document {
  assetName: string;
  marketType: string;
  currency: string;
  tradeType: string;
  entryPrice?: number;
  quantity: number;
  entryTime?: string;
  exitTime?: string;
  profitTarget?: number;
  stopLoss?: number;
  exitPrice?: number;
  mindsetBeforeTrade: string;
  tradeSetup: string;
  screenshot?: string;
  journalText: string;
  date: string;
  profitLoss: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    assetName: { type: String, required: true, trim: true },
    marketType: { type: String, default: 'Forex' },
    currency: { type: String, default: 'USD' },
    tradeType: { type: String, default: 'BUY' },
    entryPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    entryTime: { type: String },
    exitTime: { type: String },
    profitTarget: { type: Number, default: 0 },
    stopLoss: { type: Number, default: 0 },
    exitPrice: { type: Number, default: 0 },
    mindsetBeforeTrade: { type: String, default: 'Disciplined Plan' },
    tradeSetup: { type: String, default: 'Price Action' },
    screenshot: { type: String, default: '' },
    journalText: { type: String, default: '' },
    date: { type: String, required: true },
    profitLoss: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite during hot reloads
const Trade: Model<ITrade> = mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);

export default Trade;
