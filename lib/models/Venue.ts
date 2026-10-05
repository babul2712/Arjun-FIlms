import mongoose, { Schema, Document } from 'mongoose';

export interface IVenue extends Document {
  name: string;
  city?: string;
  category?: string;
  address?: string;
  createdAt: Date;
}

const VenueSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, default: '' },
  category: { type: String, default: 'Venue' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Venue;
export default (mongoose.models.Venue as any) || mongoose.model<IVenue>('Venue', VenueSchema);
