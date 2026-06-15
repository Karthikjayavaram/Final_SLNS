import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteContent extends Document {
  key: string;
  value: string; // JSON stringified content
  updatedAt: Date;
}

const SiteContentSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SiteContent ||
  mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
