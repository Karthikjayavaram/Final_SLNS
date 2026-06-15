import mongoose, { Schema, Document } from 'mongoose';

export interface IEventStyle extends Document {
  name: string;
  createdAt: Date;
}

const EventStyleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.EventStyle || mongoose.model<IEventStyle>('EventStyle', EventStyleSchema);
