import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  clientName: string;
  eventType: string;
  content: string;
  rating: number;
  imageUrl?: string;
  featured: boolean;
  createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  clientName: { type: String, required: true },
  eventType: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  imageUrl: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
