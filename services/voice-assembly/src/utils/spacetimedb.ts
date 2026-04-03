import logger from './logger';
import { globalIO } from '../index';

export const createSessionRoom = async (sessionId: string) => {
  const uri = process.env.SPACETIMEDB_URI;
  if (!uri) {
    logger.info(`[Socket.IO Fallback] Created session room: ${sessionId}`);
    return;
  }

  try {
    // Simulate SpaceTimeDB client call
    logger.info(`[SpaceTimeDB] createSessionRoom called for ${sessionId} at ${uri}`);
  } catch (err) {
    logger.error(`[SpaceTimeDB] Error: ${err}`);
  }
};

export const syncVoteUpdate = async (sessionId: string, issueId: string, count: number) => {
  const uri = process.env.SPACETIMEDB_URI;
  if (!uri) {
    logger.info(`[Socket.IO Fallback] syncVoteUpdate: session=${sessionId}, issue=${issueId}, count=${count}`);
    if (globalIO) {
      globalIO.to(sessionId).emit('vote-update', { issueId, count });
    }
    return;
  }

  try {
    // Full SpacetimeDB client call simulation
    logger.info(`[SpaceTimeDB] syncVoteUpdate called for ${sessionId} issue ${issueId} count ${count} at ${uri}`);
  } catch (err) {
    logger.error(`[SpaceTimeDB] Error syncing vote: ${err}`);
  }
};
