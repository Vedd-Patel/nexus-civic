import mongoose, { Document, Schema } from 'mongoose';

export interface ISyncQueueItem {
  nodeId: string;
  payload: Record<string, unknown>;
  delivered: boolean;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISyncQueueItemDocument extends ISyncQueueItem, Document {}

const SyncQueueItemSchema = new Schema<ISyncQueueItemDocument>(
  {
    nodeId: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    delivered: { type: Boolean, default: false, index: true },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

SyncQueueItemSchema.index({ nodeId: 1, delivered: 1, createdAt: 1 });

export const SyncQueueItem =
  mongoose.models.SyncQueueItem ||
  mongoose.model<ISyncQueueItemDocument>('SyncQueueItem', SyncQueueItemSchema);
