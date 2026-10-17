import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@aat/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { logger } from '@aat/observability';

export const operationsRouter = Router();

// 1. Get Quotations Pending Review
operationsRouter.get('/price-reviews', requireAuth, requireRole('staff', 'admin'), async (req: Request, res: Response, next) => {
  try {
    const { status = 'PENDING_REVIEW' } = req.query;
    const db = getDatabase();

    const quotations = await db.query(
      `SELECT q.*, p.business_name, p.contact_person, p.rating as provider_rating,
              r.scheduled_date, r.time_window, r.estimated_units, r.unit_type,
              f.farm_name, f.address as farm_address, d.district_name,
              fp.full_name as farmer_name
       FROM quotations q
       JOIN provider_profiles p ON q.provider_id = p.id
       JOIN service_requests r ON q.request_id = r.id
       JOIN farms f ON r.farm_id = f.id
       JOIN districts d ON f.district_id = d.id
       JOIN farmer_profiles fp ON r.farmer_id = fp.id
       WHERE (? = 'ALL' OR q.status = ?)
       ORDER BY q.created_at DESC`,
      [status, status]
    );

    // Fetch line items for each quote
    for (const q of quotations) {
      q.lines = await db.query(
        `SELECT * FROM quotation_lines WHERE quotation_id = ?`,
        [q.id]
      );
    }

    res.json({
      success: true,
      data: quotations,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Staff Price Review Action (Approve / Reject)
operationsRouter.post('/quotations/:id/review', requireAuth, requireRole('staff', 'admin'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      throw new AppError('REQUEST_VALIDATION_FAILED', 'Decision must be APPROVED or REJECTED.', 400);
    }

    if (!reason || reason.trim().length < 3) {
      throw new AppError('REQUEST_VALIDATION_FAILED', 'A valid review reason or note is required for the audit trail.', 400);
    }

    const db = getDatabase();

    const quote = await db.queryOne<{ id: string; status: string; request_id: string; total_amount: number }>(
      `SELECT id, status, request_id, total_amount FROM quotations WHERE id = ?`,
      [id]
    );

    if (!quote) {
      throw new AppError('QUOTATION_NOT_FOUND', 'Quotation not found.', 404);
    }

    if (quote.status !== 'PENDING_REVIEW') {
      throw new AppError('INVALID_STATE', `Quotation is already in state: ${quote.status}`, 400);
    }

    const reviewId = `rev-${uuidv4().substring(0, 8)}`;

    await db.transaction(async tx => {
      // 1. Update quotation status
      await tx.execute(`UPDATE quotations SET status = ? WHERE id = ?`, [decision, id]);

      // 2. Record price review record
      await tx.execute(
        `INSERT INTO price_reviews (id, quotation_id, reviewer_user_id, decision, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [reviewId, id, req.user!.userId, decision, reason]
      );

      // 3. Record sensitive actor action in audit_events
      await tx.execute(
        `INSERT INTO audit_events (id, actor_id, actor_role, action, target_type, target_id, reason, correlation_id)
         VALUES (?, ?, ?, ?, 'quotation', ?, ?, ?)`,
        [
          `aud-${uuidv4().substring(0, 8)}`,
          req.user!.userId,
          req.user!.roles.join(','),
          `PRICE_REVIEW_${decision}`,
          id,
          reason,
          req.correlationId,
        ]
      );

      // 4. Outbox Event
      await tx.execute(
        `INSERT INTO outbox_events (id, event_name, payload_json) VALUES (?, ?, ?)`,
        [
          `evt-${uuidv4().substring(0, 8)}`,
          `quotation.${decision.toLowerCase()}`,
          JSON.stringify({ quotationId: id, decision, reviewerId: req.user!.userId }),
        ]
      );
    });

    logger.audit(`QUOTATION_${decision}`, {
      correlationId: req.correlationId,
      actorId: req.user!.userId,
      actorRole: req.user!.roles.join(','),
      targetId: id,
      targetType: 'quotation',
      reason,
    });

    res.json({
      success: true,
      data: {
        quotationId: id,
        decision,
        message: `Quotation has been successfully ${decision.toLowerCase()}.`,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Staff Fallback Queue (when matching found 0 providers)
operationsRouter.get('/staff-queue', requireAuth, requireRole('staff', 'admin'), async (req: Request, res: Response, next) => {
  try {
    const db = getDatabase();
    const queue = await db.query(
      `SELECT r.*, f.farm_name, f.address as farm_address, d.district_name, fp.full_name as farmer_name
       FROM service_requests r
       JOIN farms f ON r.farm_id = f.id
       JOIN districts d ON f.district_id = d.id
       JOIN farmer_profiles fp ON r.farmer_id = fp.id
       WHERE r.status = 'STAFF_QUEUE'
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      data: queue,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});
