import { getDatabase } from '@aat/database';
import { logger } from '@aat/observability';
import { matchProvidersForRequest } from '@aat/domain';

interface OutboxRecord {
  id: string;
  event_name: string;
  payload_json: string;
  retry_count: number;
}

let isRunning = true;

async function processOutboxBatch(): Promise<void> {
  const db = getDatabase();
  try {
    const pendingEvents = await db.query<OutboxRecord>(
      `SELECT id, event_name, payload_json, retry_count
       FROM outbox_events
       WHERE status = 'PENDING' AND retry_count < 5
       ORDER BY created_at ASC
       LIMIT 10`
    );

    for (const record of pendingEvents) {
      try {
        const payload = JSON.parse(record.payload_json);
        logger.info(`[Worker] Processing event: ${record.event_name} (${record.id})`);

        if (record.event_name === 'request.submitted') {
          await matchProvidersForRequest(db, payload.requestId);
        } else if (record.event_name === 'booking.confirmed') {
          logger.info(`[Worker] Simulating booking confirmation dispatch:`, payload);
        } else if (record.event_name === 'booking.completed') {
          logger.info(`[Worker] Simulating payout settlement release:`, payload);
        }

        await db.execute(
          `UPDATE outbox_events SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [record.id]
        );
      } catch (err: any) {
        logger.error(`[Worker] Failed to process event ${record.id}`, err);
        await db.execute(
          `UPDATE outbox_events SET retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
          [err?.message || 'Unknown error', record.id]
        );
      }
    }
  } catch (err) {
    logger.error('[Worker] Error during outbox poll iteration', err);
  }
}

async function startWorkerLoop() {
  logger.info('[Worker] Starting Transactional Outbox Background Worker...');
  const db = getDatabase();
  const { runMigrations } = await import('@aat/database');
  await runMigrations(db);
  while (isRunning) {
    await processOutboxBatch();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

process.on('SIGINT', () => {
  logger.info('[Worker] Shutting down worker...');
  isRunning = false;
  process.exit(0);
});

startWorkerLoop().catch(err => {
  logger.error('[Worker] Fatal worker error', err);
  process.exit(1);
});
