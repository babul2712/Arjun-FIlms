import mongoose, { Schema, Document, Model } from 'mongoose';

export type Currency = '₹' | '$' | '€' | '£';
export type TradeType = 'Buy' | 'Sell';
export type MarketType = 'Forex' | 'Crypto' | 'Indian Stock' | 'Binary' | 'US Stock' | 'Other';

export interface ITrade extends Document {
  assetName: string;
  marketType: MarketType;
  currency: Currency;
  tradeType?: TradeType;
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
    marketType: { 
      type: String, 
      enum: ['Forex', 'Crypto', 'Indian Stock', 'Binary', 'US Stock', 'Other'], 
      default: 'Indian Stock' 
    },
    currency: { type: String, default: '₹' },
    tradeType: { type: String, enum: ['Buy', 'Sell'], default: 'Buy' },
    entryPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    entryTime: { type: String },
    exitTime: { type: String },
    profitTarget: { type: Number, default: 0 },
    stopLoss: { type: Number, default: 0 },
    exitPrice: { type: Number, default: 0 },
    mindsetBeforeTrade: { type: String, default: 'Confident' },
    tradeSetup: { type: String, default: 'Price Action' },
    screenshot: { type: String },
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
