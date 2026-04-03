import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from '@nexus-civic/db';
import { logger } from './utils/logger';
import { detectAnomalies } from './utils/budgetAnomalyDetector';

import expenditureRoutes from './routes/expenditure.routes';
import budgetRoutes from './routes/budget.routes';

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Routes
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/budget', budgetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ledger-civic' });
});

// Start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-civic';
    await connectDB(mongoUri);
    logger.info('Connected to MongoDB');

    app.listen(PORT, () => {
      logger.info(`Ledger-Civic service listening on port ${PORT}`);
      
      // Initial detection and interval
      detectAnomalies();
      setInterval(detectAnomalies, 60 * 60 * 1000); // Every hour
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
