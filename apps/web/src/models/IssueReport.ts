import mongoose from 'mongoose';

export interface IIssueReport extends mongoose.Document {
  title: string;
  description: string;
  category: string;
  district: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photo?: string;
  status: 'active' | 'resolved';
  createdAt: Date;
}

const IssueReportSchema = new mongoose.Schema<IIssueReport>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  district: { type: String, required: false },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: false },
  },
  photo: { type: String, required: false },
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

export default mongoose.models.IssueReport || mongoose.model<IIssueReport>('IssueReport', IssueReportSchema);
