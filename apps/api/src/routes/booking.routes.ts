import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@aat/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { selectQuotationAtomic, verifyWorkCompletion } from '@aat/domain';
import { BookingStatus, PaymentCondition } from '@aat/contracts';

export const bookingRouter = Router();

// 1. Get Approved Quotations for a Farmer's Request
bookingRouter.get('/requests/:requestId/quotations', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { requestId } = req.params;
    const db = getDatabase();

    // Farmer only sees APPROVED quotations (Operations gate enforced server-side!)
    const quotations = await db.query(
      `SELECT q.id, q.request_id, q.provider_id, q.status, q.total_amount, q.provider_note, q.valid_until, q.created_at,
              p.business_name, p.contact_person, p.rating, p.is_verified,
              inv.distance_km
       FROM quotations q
       JOIN provider_profiles p ON q.provider_id = p.id
       JOIN provider_invitations inv ON q.invitation_id = inv.id
       WHERE q.request_id = ? AND q.status = 'APPROVED'
       ORDER BY q.total_amount ASC`,
      [requestId]
    );

    for (const q of quotations) {
      q.lines = await db.query(
        `SELECT unit, quantity, unit_rate, mobilization_charge, material_charge, tax_amount, line_total
         FROM quotation_lines
         WHERE quotation_id = ?`,
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

// 2. Farmer Selects Quotation -> Confirmed Booking
bookingRouter.post('/quotations/:id/select', requireAuth, requireRole('farmer'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { paymentCondition = 'CASH' } = req.body;
    const db = getDatabase();

    const result = await selectQuotationAtomic(
      db,
      id,
      req.user!.userId,
      paymentCondition as PaymentCondition
    );

    res.json({
      success: true,
      data: {
        bookingId: result.bookingId,
        status: result.status,
        paymentType: result.paymentType,
        totalAmount: result.totalAmount,
        completionOtp: result.completionOtp,
        message: 'Booking confirmed! Keep your completion OTP safe and share it with the provider only after satisfactory completion of work.',
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get Booking Details
bookingRouter.get('/bookings/:id', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const booking = await db.queryOne(
      `SELECT b.*,
              fp.full_name as farmer_name, u_f.phone as farmer_phone,
              pp.business_name as provider_business, pp.contact_person as provider_contact, u_p.phone as provider_phone,
              f.farm_name, f.address as farm_address, f.latitude as farm_latitude, f.longitude as farm_longitude,
              s.name as service_name, r.scheduled_date, r.time_window
       FROM bookings b
       JOIN farmer_profiles fp ON b.farmer_id = fp.id
       JOIN users u_f ON fp.user_id = u_f.id
       JOIN provider_profiles pp ON b.provider_id = pp.id
       JOIN users u_p ON pp.user_id = u_p.id
       JOIN service_requests r ON b.request_id = r.id
       JOIN farms f ON r.farm_id = f.id
       JOIN services s ON r.service_id = s.id
       WHERE b.id = ?`,
      [id]
    );

    if (!booking) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    }

    const history = await db.query(
      `SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY created_at ASC`,
      [id]
    );

    const quotationLines = await db.query(
      `SELECT * FROM quotation_lines WHERE quotation_id = ?`,
      [booking.quotation_id]
    );

    res.json({
      success: true,
      data: {
        ...booking,
        history,
        quotationLines,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Provider Updates Execution / Trip State
bookingRouter.post('/bookings/:id/trip-update', requireAuth, requireRole('provider'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { newStatus, note } = req.body;

    const allowedTransitions: BookingStatus[] = [
      'TRAVEL_READY',
      'IN_PROGRESS',
      'ARRIVED',
      'WORK_STARTED',
      'COMPLETION_PENDING_OTP',
    ];

    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError('INVALID_STATUS_TRANSITION', `Status transition to ${newStatus} is not permitted.`, 400);
    }

    const db = getDatabase();
    const current = await db.queryOne<{ id: string; status: BookingStatus }>(
      `SELECT id, status FROM bookings WHERE id = ?`,
      [id]
    );

    if (!current) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    }

    await db.transaction(async tx => {
      await tx.execute(
        `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newStatus, id]
      );

      await tx.execute(
        `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `bsh-${uuidv4().substring(0, 8)}`,
          id,
          current.status,
          newStatus,
          req.user!.userId,
          note || `Provider transitioned trip to ${newStatus}`,
        ]
      );
    });

    res.json({
      success: true,
      data: {
        bookingId: id,
        previousStatus: current.status,
        newStatus,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 5. Provider Verifies Work Completion via Farmer's 6-digit OTP
bookingRouter.post('/bookings/:id/verify-completion', requireAuth, requireRole('provider'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { completionOtp } = req.body;

    if (!completionOtp || typeof completionOtp !== 'string') {
      throw new AppError('REQUEST_VALIDATION_FAILED', '6-digit farmer completion OTP is required.', 400);
    }

    const db = getDatabase();
    const result = await verifyWorkCompletion(db, id, completionOtp, req.user!.userId);

    res.json({
      success: true,
      data: {
        bookingId: id,
        finalStatus: result.newStatus,
        message: 'Completion OTP verified successfully! The service has been marked complete and payment/settlement finalized.',
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});
