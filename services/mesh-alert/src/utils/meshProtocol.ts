import { RescueEvent } from '@nexus-civic/db';

import { createLogger } from './logger';
import { callService } from './serviceClient';

const logger = createLogger(process.env.SERVICE_NAME ?? 'mesh-alert');

export interface MeshMessage {
  msgId: string;
  type: 'SOS' | 'LOCATION' | 'RESCUE_UPDATE' | 'DRONE_WAYPOINT';
  origin: string;
  hops: string[];
  timestamp: number;
  payload: Record<string, unknown>;
}

const processedMessages = new Map<string, number>();

export function validateMeshMessage(raw: unknown): MeshMessage | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const msg = raw as Partial<MeshMessage>;
  const validTypes = new Set(['SOS', 'LOCATION', 'RESCUE_UPDATE', 'DRONE_WAYPOINT']);

  if (
    typeof msg.msgId !== 'string' ||
    !validTypes.has(String(msg.type)) ||
    typeof msg.origin !== 'string' ||
    !Array.isArray(msg.hops) ||
    !msg.hops.every((hop) => typeof hop === 'string') ||
    typeof msg.timestamp !== 'number' ||
    typeof msg.payload !== 'object' ||
    msg.payload === null
  ) {
    return null;
  }

  if (msg.hops.length > 10) {
    return null;
  }

  const maxAgeMs = 30 * 60 * 1000;
  if (Date.now() - msg.timestamp > maxAgeMs) {
    return null;
  }

  if (processedMessages.has(msg.msgId)) {
    return null;
  }

  processedMessages.set(msg.msgId, Date.now());

  return {
    msgId: msg.msgId,
    type: msg.type as MeshMessage['type'],
    origin: msg.origin,
    hops: msg.hops,
    timestamp: msg.timestamp,
    payload: msg.payload as Record<string, unknown>,
  };
}

export async function processMeshSOS(msg: MeshMessage): Promise<void> {
  const payload = msg.payload;
  const lat = Number(payload.lat);
  const lng = Number(payload.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('SOS payload must include numeric lat and lng');
  }

  const descriptionBase = typeof payload.description === 'string' ? payload.description : 'Mesh SOS event';
  const description = `[mesh-msg:${msg.msgId}] ${descriptionBase}`;

  await RescueEvent.findOneAndUpdate(
    { description },
    {
      $setOnInsert: {
        type: 'SOS',
        reportedBy: msg.origin,
        meshNodes: msg.hops.length ? msg.hops : [msg.origin],
        status: 'ACTIVE',
        location: { lat, lng },
        description,
      },
      $set: {
        location: { lat, lng },
        meshNodes: msg.hops.length ? msg.hops : [msg.origin],
        status: 'ACTIVE',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const guardianNetUrl = process.env.GUARDIAN_NET_URL ?? 'http://guardian-net:3001';
  void callService(
    guardianNetUrl,
    'POST',
    '/api/sos/trigger',
    {
      type: 'mesh',
      location: { lat, lng },
      userId: msg.origin,
      deviceId: msg.origin,
      metadata: {
        msgId: msg.msgId,
        hops: msg.hops,
        timestamp: msg.timestamp,
      },
    },
    3000
  ).catch((error) => {
    logger.warn('guardian-net SOS trigger failed', {
      msgId: msg.msgId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

export async function aggregateRescueMap(): Promise<Record<string, unknown>> {
  const since = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const events = await RescueEvent.find({
    status: 'ACTIVE',
    createdAt: { $gte: since },
  }).lean();

  const features = events
    .filter(
      (event) =>
        event.location &&
        typeof event.location.lat === 'number' &&
        typeof event.location.lng === 'number'
    )
    .map((event) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [event.location.lng, event.location.lat],
      },
      properties: {
        id: String(event._id),
        type: event.type,
        status: event.status,
        reportedBy: event.reportedBy,
        meshNodes: event.meshNodes,
        description: event.description,
        createdAt: event.createdAt,
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function cleanStaleMeshCache(): void {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [msgId, seenAt] of processedMessages.entries()) {
    if (seenAt < cutoff) {
      processedMessages.delete(msgId);
    }
  }
}
