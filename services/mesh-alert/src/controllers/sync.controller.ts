import type { Request, Response } from 'express';

import { SyncQueueItem } from '../models/SyncQueueItem.model';

export async function getPendingSync(req: Request, res: Response): Promise<void> {
  const { nodeId } = req.params;

  const items = await SyncQueueItem.find({
    nodeId,
    delivered: false,
  })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  res.json({
    success: true,
    data: items,
    meta: {
      nodeId,
      count: items.length,
    },
  });
}

export async function confirmSync(req: Request, res: Response): Promise<void> {
  const { nodeId } = req.params;
  const body = req.body as { ids?: string[] };

  const filter: Record<string, unknown> = {
    nodeId,
    delivered: false,
  };

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    filter._id = { $in: body.ids };
  }

  const updateResult = await SyncQueueItem.updateMany(filter, {
    $set: {
      delivered: true,
      deliveredAt: new Date(),
    },
  });

  res.json({
    success: true,
    data: {
      nodeId,
      acknowledged: updateResult.modifiedCount,
    },
  });
}
