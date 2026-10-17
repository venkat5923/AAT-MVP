import express from 'express';
import cors from 'cors';
import { config } from '@aat/config';
import { logger } from '@aat/observability';
import { getDatabase, runMigrations, seedDatabase } from '@aat/database';
import { correlationMiddleware } from './middleware/correlation';
import { authMiddleware } from './middleware/auth';
import { errorMiddleware } from './middleware/error';

import { authRouter } from './routes/auth.routes';
import { catalogRouter } from './routes/catalog.routes';
import { farmerRouter } from './routes/farmer.routes';
import { providerRouter } from './routes/provider.routes';
import { operationsRouter } from './routes/operations.routes';
import { bookingRouter } from './routes/booking.routes';

export const app = express();

// Base Middleware
app.use(cors());
app.use(express.json());
app.use(correlationMiddleware);
app.use(authMiddleware);

// Health Check Endpoint (Phase 0 Task 6)
app.get('/health', async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.queryOne('SELECT 1 as healthy');
    res.json({
      status: 'UP',
      service: 'aat-api',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      database: result && result.healthy === 1 ? 'CONNECTED' : 'UNKNOWN',
      correlationId: req.correlationId,
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'DOWN',
      service: 'aat-api',
      error: err.message,
      correlationId: req.correlationId,
    });
  }
});

// Mount /api/v1 Routes
const v1Router = express.Router();
v1Router.use('/auth', authRouter);
v1Router.use('/', catalogRouter);
v1Router.use('/', farmerRouter);
v1Router.use('/provider', providerRouter);
v1Router.use('/operations', operationsRouter);
v1Router.use('/', bookingRouter);

app.use('/api/v1', v1Router);

// Global Error Handler
app.use(errorMiddleware);

// Startup Routine
export async function startServer() {
  const db = getDatabase();
  await runMigrations(db);
  await seedDatabase(db);

  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Akanksha Agree Tech (AAT) API server running on port ${config.port}`, {
      port: config.port,
      environment: config.nodeEnv,
    });
  });
}

if (require.main === module) {
  startServer().catch(err => {
    logger.error('Failed to start AAT API server', err);
    process.exit(1);
  });
}
