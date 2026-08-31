import mongoose, { Schema, Document } from 'mongoose';

export interface ICrew extends Document {
  name: string;
  role: string;
  location: string;
  phone: string;
  address: string;
  charges: number;
  createdAt: Date;
}

const CrewSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  charges: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models.Crew as any) || mongoose.model<ICrew>('Crew', CrewSchema);
