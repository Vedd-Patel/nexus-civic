import type { Request, Response } from 'express';
import { MeshNode } from '@nexus-civic/db';

export async function registerNode(req: Request, res: Response): Promise<void> {
  const { deviceId, location, batteryLevel, meshCapabilities } = req.body as {
    deviceId: string;
    location: { lat: number; lng: number; accuracy?: number; address?: string; s2CellId?: string };
    batteryLevel?: number;
    meshCapabilities: string[];
  };

  const node = await MeshNode.findOneAndUpdate(
    { deviceId },
    {
      $set: {
        location,
        batteryLevel,
        meshCapabilities,
        lastSeen: new Date(),
      },
      $setOnInsert: { deviceId },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: node });
}

export async function getActiveNodes(req: Request, res: Response): Promise<void> {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm ?? 10);

  const lastSeenCutoff = new Date(Date.now() - 15 * 60 * 1000);

  const query: Record<string, unknown> = {
    lastSeen: { $gte: lastSeenCutoff },
  };

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: Math.max(1, radiusKm) * 1000,
      },
    };
  }

  const nodes = await MeshNode.find(query).sort({ lastSeen: -1 }).lean();

  res.json({
    success: true,
    data: nodes,
    meta: {
      count: nodes.length,
      lastSeenCutoff,
      filters: {
        lat: Number.isFinite(lat) ? lat : undefined,
        lng: Number.isFinite(lng) ? lng : undefined,
        radiusKm,
      },
    },
  });
}
