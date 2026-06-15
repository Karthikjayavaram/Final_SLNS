import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  category: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'mixed';
  featured: boolean;
  visibility: boolean;
  displayOrder: number;
  tags: string[];
  clientName?: string;
  location?: string;
  eventDate?: Date;
  uploadDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    category: {
      type: String,
      required: true,
      default: 'Other',
    },
    // orientation removed
    mediaUrls: [{ type: String }],
    mediaType: {
      type: String,
      enum: ['image', 'video', 'mixed'],
      default: 'image',
    },
    featured: { type: Boolean, default: false },
    visibility: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String }],
    clientName: { type: String },
    location: { type: String },
    eventDate: { type: Date },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
