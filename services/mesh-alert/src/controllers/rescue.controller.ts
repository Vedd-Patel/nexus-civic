import type { Request, Response } from 'express';
import { RescueEvent } from '@nexus-civic/db';

import { aggregateRescueMap, processMeshSOS, validateMeshMessage } from '../utils/meshProtocol';

export async function createRescueEvent(req: Request, res: Response): Promise<void> {
  const { location, type, description, reportedBy, meshNodes, status } = req.body as {
    location: { lat: number; lng: number; accuracy?: number; address?: string; s2CellId?: string };
    type: string;
    description?: string;
    reportedBy: string;
    meshNodes: string[];
    status?: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  };

  const event = await RescueEvent.create({
    location,
    type,
    description,
    reportedBy,
    meshNodes,
    status: status ?? 'ACTIVE',
  });

  res.status(201).json({ success: true, data: event });
}

export async function getActiveRescueMap(_req: Request, res: Response): Promise<void> {
  const geoJson = await aggregateRescueMap();
  res.json({ success: true, data: geoJson });
}

export async function receiveMeshSOS(req: Request, res: Response): Promise<void> {
  const validated = validateMeshMessage(req.body);
  if (!validated) {
    res.status(400).json({ success: false, error: 'Invalid or duplicate mesh message', code: 400 });
    return;
  }

  if (validated.type !== 'SOS') {
    res.status(400).json({ success: false, error: 'Only SOS mesh messages are accepted', code: 400 });
    return;
  }

  await processMeshSOS(validated);

  res.status(202).json({
    success: true,
    message: 'SOS mesh message accepted',
    data: {
      msgId: validated.msgId,
      origin: validated.origin,
      hops: validated.hops,
    },
  });
}
