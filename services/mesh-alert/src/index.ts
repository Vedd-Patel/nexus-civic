import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from '@nexus-civic/db';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import meshRoutes from './routes/mesh.routes';
import rescueRoutes from './routes/rescue.routes';
import syncRoutes from './routes/sync.routes';
import { cleanStaleMeshCache } from './utils/meshProtocol';
import { createLogger } from './utils/logger';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3010);
const mongoUri =
  process.env.MONGODB_URI ?? process.env.MONGO_URI ?? 'mongodb://localhost:27017/nexus-civic';

const logger = createLogger(process.env.SERVICE_NAME ?? 'mesh-alert');

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

connectDB(mongoUri)
  .then(() => {
    logger.info('MongoDB connected for mesh-alert');
  })
  .catch((error) => {
    logger.error('MongoDB connection failed for mesh-alert', {
      error: error instanceof Error ? error.message : String(error),
    });
  });

app.use('/api/mesh', meshRoutes);
app.use('/api/rescue', rescueRoutes);
app.use('/api/sync', syncRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mesh-alert',
    port,
    timestamp: new Date().toISOString(),
  });
});

setInterval(() => {
  cleanStaleMeshCache();
}, 5 * 60 * 1000);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`mesh-alert listening on port ${port}`);
});
