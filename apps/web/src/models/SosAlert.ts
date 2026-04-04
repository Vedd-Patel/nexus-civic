import mongoose from 'mongoose';

export interface ISosAlert extends mongoose.Document {
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'resolved';
  createdAt: Date;
}

const SosAlertSchema = new mongoose.Schema<ISosAlert>({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SosAlert || mongoose.model<ISosAlert>('SosAlert', SosAlertSchema);
