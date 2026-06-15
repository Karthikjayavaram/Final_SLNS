import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: Date;
  location: string;
  specialRequirements?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  location: { type: String, required: true },
  specialRequirements: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending',
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
