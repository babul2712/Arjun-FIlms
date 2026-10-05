import mongoose, { Schema, Document } from 'mongoose';

export interface IEventType extends Document {
  name: string;
  createdAt: Date;
}

const EventTypeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.EventType;
export default (mongoose.models.EventType as any) || mongoose.model<IEventType>('EventType', EventTypeSchema);
