import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/logger';
import sessionRoutes from './routes/session.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
export const globalIO = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));

app.use('/api/sessions', sessionRoutes);
app.use(errorHandler);

// Socket.IO Events
globalIO.on('connection', (socket: any) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-session', (sessionId: string) => {
    socket.join(sessionId);
    logger.info(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('cast-vote', (data: any) => {
    // Basic socket broadcasting (controller also does this, but we can do it here if needed)
    // Normally we'd validate, but for simple broadcast:
    // globalIO.to(data.sessionId).emit('vote-update', data);
    logger.info(`Socket ${socket.id} cast-vote event:`, data);
  });

  socket.on('submit-issue', (data: any) => {
    logger.info(`Socket ${socket.id} submit-issue event:`, data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3008;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_civic';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    httpServer.listen(PORT, () => {
      logger.info(`Voice Assembly service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
