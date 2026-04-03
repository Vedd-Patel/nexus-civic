import mongoose, { Schema, Document } from 'mongoose';
import { IBudgetAnomaly } from '@nexus-civic/shared-types';

export interface IBudgetAnomalyDocument extends Omit<IBudgetAnomaly, '_id' | 'createdAt'>, Document {
  createdAt: Date;
}

const BudgetAnomalySchema = new Schema<IBudgetAnomalyDocument>(
  {
    department: { type: String, required: true },
    category: { type: String, required: true },
    expectedAllocation: { type: Number, required: true },
    actualTotal: { type: Number, required: true },
    variancePercentage: { type: Number, required: true },
    month: { type: String, required: true },
    status: { type: String, enum: ['PENDING_REVIEW', 'FLAGGED', 'EXPLAINED'], default: 'PENDING_REVIEW' },
  },
  {
    timestamps: true,
  }
);

BudgetAnomalySchema.index({ department: 1, month: 1 });

/**
 * BudgetAnomaly Model (used by LedgerCivic)
 */
export const BudgetAnomaly = mongoose.models.BudgetAnomaly || mongoose.model<IBudgetAnomalyDocument>('BudgetAnomaly', BudgetAnomalySchema);
