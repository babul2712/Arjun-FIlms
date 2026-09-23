import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssetType = 'Crypto' | 'Stock' | 'Commodity' | 'Index' | 'ETF' | 'Mutual Fund';
export type Currency = '₹' | '$' | '€' | '£';

export interface IInvestment extends Document {
  assetName: string;
  assetType: AssetType;
  currency: Currency;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  notes?: string;
  dateAdded: string;
  investmentValue: number;
  currentValue: number;
  profitLoss: number;
  iconUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    assetName: { type: String, required: true, trim: true },
    assetType: { 
      type: String, 
      enum: ['Crypto', 'Stock', 'Commodity', 'Index', 'ETF', 'Mutual Fund'], 
      default: 'Stock' 
    },
    currency: { type: String, default: '₹' },
    buyPrice: { type: Number, required: true, default: 0 },
    currentPrice: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 1 },
    notes: { type: String, default: '' },
    dateAdded: { type: String, required: true },
    investmentValue: { type: Number, required: true, default: 0 },
    currentValue: { type: Number, required: true, default: 0 },
    profitLoss: { type: Number, required: true, default: 0 },
    iconUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite during hot reloads
const Investment: Model<IInvestment> = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;
