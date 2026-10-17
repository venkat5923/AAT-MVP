import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@aat/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { calculateQuotationTotals } from '@aat/domain';
import { logger } from '@aat/observability';

export const providerRouter = Router();

async function getProviderProfileId(userId: string): Promise<string> {
  const db = getDatabase();
  const profile = await db.queryOne<{ id: string }>(
    `SELECT id FROM provider_profiles WHERE user_id = ?`,
    [userId]
  );
  if (!profile) {
    throw new AppError('PROVIDER_PROFILE_REQUIRED', 'Provider profile required to perform this action.', 403);
  }
  return profile.id;
}

// 1. Get Provider's Invitations
providerRouter.get('/invitations', requireAuth, requireRole('provider'), async (req: Request, res: Response, next) => {
  try {
    const providerId = await getProviderProfileId(req.user!.userId);
    const db = getDatabase();

    const invitations = await db.query(
      `SELECT inv.*, r.scheduled_date, r.time_window, r.estimated_units, r.unit_type, r.notes,
              f.farm_name, f.address as farm_address, d.district_name, s.name as service_name,
              q.id as submitted_quotation_id, q.status as quotation_status, q.total_amount as quotation_amount
       FROM provider_invitations inv
       JOIN service_requests r ON inv.request_id = r.id
       JOIN farms f ON r.farm_id = f.id
       JOIN districts d ON f.district_id = d.id
       JOIN services s ON r.service_id = s.id
       LEFT JOIN quotations q ON inv.id = q.invitation_id
       WHERE inv.provider_id = ?
       ORDER BY inv.created_at DESC`,
      [providerId]
    );

    res.json({
      success: true,
      data: invitations,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Submit Itemized Quotation
providerRouter.post('/invitations/:id/quotation', requireAuth, requireRole('provider'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { lines, providerNote, validHours = 24 } = req.body;
    const providerId = await getProviderProfileId(req.user!.userId);

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      throw new AppError(
        'REQUEST_VALIDATION_FAILED',
        'At least one quotation line item is required.',
        400,
        [{ field: 'lines', issue: 'Quotation lines cannot be empty' }]
      );
    }

    const db = getDatabase();

    // Verify invitation belongs to provider and is open
    const invitation = await db.queryOne<{
      id: string;
      request_id: string;
      provider_id: string;
      status: string;
      offer_expires_at: string;
    }>(
      `SELECT id, request_id, provider_id, status, offer_expires_at
       FROM provider_invitations
       WHERE id = ? AND provider_id = ?`,
      [id, providerId]
    );

    if (!invitation) {
      throw new AppError('INVITATION_NOT_FOUND', 'Invitation not found or does not belong to you.', 404);
    }

    if (new Date(invitation.offer_expires_at).getTime() < Date.now()) {
      throw new AppError('OFFER_WINDOW_EXPIRED', 'The offer window for this invitation has expired.', 400);
    }

    // Verify quotation hasn't already been submitted
    const existingQuote = await db.queryOne(
      `SELECT id FROM quotations WHERE invitation_id = ?`,
      [id]
    );
    if (existingQuote) {
      throw new AppError('QUOTATION_ALREADY_EXISTS', 'A quotation has already been submitted for this invitation.', 400);
    }

    // Calculate totals
    const { totalAmount, calculatedLines } = calculateQuotationTotals(lines);
    const quotationId = `quot-${uuidv4().substring(0, 8)}`;
    const validUntil = new Date(Date.now() + validHours * 3600 * 1000).toISOString();

    await db.transaction(async tx => {
      // Insert quotation (Starts as PENDING_REVIEW — hidden from farmer until Operations approval!)
      await tx.execute(
        `INSERT INTO quotations (id, invitation_id, request_id, provider_id, status, total_amount, provider_note, valid_until)
         VALUES (?, ?, ?, ?, 'PENDING_REVIEW', ?, ?, ?)`,
        [quotationId, id, invitation.request_id, providerId, totalAmount, providerNote || null, validUntil]
      );

      // Insert quotation lines
      for (const line of calculatedLines) {
        await tx.execute(
          `INSERT INTO quotation_lines (id, quotation_id, unit, quantity, unit_rate, mobilization_charge, material_charge, tax_amount, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `qline-${uuidv4().substring(0, 8)}`,
            quotationId,
            line.unit,
            line.quantity,
            line.unitRate,
            line.mobilizationCharge || 0,
            line.materialCharge || 0,
            line.taxAmount || 0,
            line.lineTotal,
          ]
        );
      }

      // Update invitation status
      await tx.execute(`UPDATE provider_invitations SET status = 'SUBMITTED' WHERE id = ?`, [id]);

      // Update request status to QUOTATIONS_RECEIVED if still OFFER_WINDOW_OPEN
      await tx.execute(
        `UPDATE service_requests SET status = 'QUOTATIONS_RECEIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'OFFER_WINDOW_OPEN'`,
        [invitation.request_id]
      );

      // Outbox Event
      await tx.execute(
        `INSERT INTO outbox_events (id, event_name, payload_json) VALUES (?, 'quotation.submitted', ?)`,
        [
          `evt-${uuidv4().substring(0, 8)}`,
          JSON.stringify({ quotationId, requestId: invitation.request_id, totalAmount }),
        ]
      );
    });

    logger.info(`Quotation submitted: ${quotationId} for request ${invitation.request_id}`);

    res.status(201).json({
      success: true,
      data: {
        quotationId,
        totalAmount,
        status: 'PENDING_REVIEW',
        message: 'Quotation submitted successfully. It will be reviewed by Akanksha operations before dispatching to the farmer.',
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});
