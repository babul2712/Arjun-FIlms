import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  client: string;
  date: Date;
  venue: string;
  photographers: string[];
  videographers: string[];
  package: string;
  advancePaid: number;
  pending: number;
  status: string;
  createdAt: Date;
  projectId?: string;
}

const BookingSchema: Schema = new Schema({
  client: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  photographers: [{ type: String }],
  videographers: [{ type: String }],
  package: { type: String, required: true },
  advancePaid: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
});

export default (mongoose.models.Booking as any) || mongoose.model<IBooking>('Booking', BookingSchema);
