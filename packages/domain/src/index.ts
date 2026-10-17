import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseClient } from '@aat/database';
import { config } from '@aat/config';
import { logger } from '@aat/observability';
import {
  BookingStatus,
  PaymentCondition,
  QuotationStatus,
  ServiceRequestStatus,
  SubmitQuotationLineDto,
} from '@aat/contracts';

// 1. Geospatial Haversine Distance (km)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 2. Matching Engine
export interface MatchingResult {
  requestId: string;
  invitedCount: number;
  status: 'OFFER_WINDOW_OPEN' | 'STAFF_QUEUE';
  invitedProviders: Array<{
    providerId: string;
    businessName: string;
    distanceKm: number;
    invitationId: string;
  }>;
}

export async function matchProvidersForRequest(
  db: DatabaseClient,
  requestId: string
): Promise<MatchingResult> {
  logger.info(`Running matching engine for request: ${requestId}`);

  // Fetch request and farm coordinates
  const req = await db.queryOne<{
    id: string;
    service_id: string;
    latitude: number;
    longitude: number;
  }>(
    `SELECT r.id, r.service_id, f.latitude, f.longitude
     FROM service_requests r
     JOIN farms f ON r.farm_id = f.id
     WHERE r.id = ?`,
    [requestId]
  );

  if (!req) {
    throw new Error(`Request not found: ${requestId}`);
  }

  // Load verified, available providers offering this service
  const providers = await db.query<{
    provider_id: string;
    business_name: string;
    base_latitude: number;
    base_longitude: number;
    service_radius_km: number;
    capacity: number;
  }>(
    `SELECT p.id as provider_id, p.business_name, ps.base_latitude, ps.base_longitude, ps.service_radius_km, ps.capacity
     FROM provider_profiles p
     JOIN provider_services ps ON p.id = ps.provider_id
     WHERE p.is_verified = 1
       AND ps.is_available = 1
       AND ps.service_id = ?`,
    [req.service_id]
  );

  // Filter by radius & sort by distance
  const eligible = providers
    .map(p => {
      const distanceKm = calculateDistanceKm(
        req.latitude,
        req.longitude,
        p.base_latitude,
        p.base_longitude
      );
      return { ...p, distanceKm };
    })
    .filter(p => p.distanceKm <= p.service_radius_km)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, config.marketplace.providerLimit);

  if (eligible.length === 0) {
    logger.warn(`No eligible providers within radius for request ${requestId}. Routing to STAFF_QUEUE.`);
    await db.execute(
      `UPDATE service_requests SET status = 'STAFF_QUEUE', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [requestId]
    );
    return {
      requestId,
      invitedCount: 0,
      status: 'STAFF_QUEUE',
      invitedProviders: [],
    };
  }

  // Calculate offer window expiration (default 60 minutes)
  const expiresAt = new Date(
    Date.now() + config.marketplace.offerWindowMinutes * 60 * 1000
  ).toISOString();

  const invitedList = [];

  for (const prov of eligible) {
    const invitationId = `inv-${uuidv4().substring(0, 8)}`;
    await db.execute(
      `INSERT OR REPLACE INTO provider_invitations (id, request_id, provider_id, status, distance_km, offer_expires_at)
       VALUES (?, ?, ?, 'PENDING', ?, ?)`,
      [invitationId, requestId, prov.provider_id, prov.distanceKm, expiresAt]
    );

    // Record notification intent for provider
    await db.execute(
      `INSERT INTO notification_intents (id, recipient_phone, channel, message, status)
       VALUES (?, ?, 'SMS', ?, 'PENDING')`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        prov.provider_id,
        `New Tractor Service Request matching your location (${prov.distanceKm} km away). Submit your quote within ${config.marketplace.offerWindowMinutes} mins.`,
      ]
    );

    invitedList.push({
      providerId: prov.provider_id,
      businessName: prov.business_name,
      distanceKm: prov.distanceKm,
      invitationId,
    });
  }

  // Update request status to OFFER_WINDOW_OPEN
  await db.execute(
    `UPDATE service_requests SET status = 'OFFER_WINDOW_OPEN', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [requestId]
  );

  logger.info(`Successfully invited ${eligible.length} providers for request ${requestId}`);

  return {
    requestId,
    invitedCount: eligible.length,
    status: 'OFFER_WINDOW_OPEN',
    invitedProviders: invitedList,
  };
}

// 3. Price Calculation
export function calculateQuotationTotals(lines: SubmitQuotationLineDto[]): {
  totalAmount: number;
  calculatedLines: Array<SubmitQuotationLineDto & { lineTotal: number }>;
} {
  let grandTotal = 0;
  const calculatedLines = lines.map(line => {
    const subtotal = line.quantity * line.unitRate;
    const lineTotal =
      subtotal + (line.mobilizationCharge || 0) + (line.materialCharge || 0) + (line.taxAmount || 0);
    grandTotal += lineTotal;
    return {
      ...line,
      lineTotal: Math.round(lineTotal * 100) / 100,
    };
  });

  return {
    totalAmount: Math.round(grandTotal * 100) / 100,
    calculatedLines,
  };
}

// 4. Atomic Quotation Selection & Booking Creation
export interface SelectionResult {
  bookingId: string;
  status: BookingStatus;
  paymentType: PaymentCondition;
  totalAmount: number;
  completionOtp: string; // Plaintext OTP for the farmer
}

export async function selectQuotationAtomic(
  db: DatabaseClient,
  quotationId: string,
  farmerUserId: string,
  paymentCondition: PaymentCondition = 'CASH'
): Promise<SelectionResult> {
  return await db.transaction(async tx => {
    // 1. Fetch quotation and request with lock semantics
    const quote = await tx.queryOne<{
      id: string;
      request_id: string;
      provider_id: string;
      status: QuotationStatus;
      total_amount: number;
      valid_until: string;
      farmer_id: string;
      request_status: ServiceRequestStatus;
    }>(
      `SELECT q.id, q.request_id, q.provider_id, q.status, q.total_amount, q.valid_until,
              r.farmer_id, r.status as request_status
       FROM quotations q
       JOIN service_requests r ON q.request_id = r.id
       WHERE q.id = ?`,
      [quotationId]
    );

    if (!quote) {
      throw new Error('Quotation not found.');
    }

    if (quote.status !== 'APPROVED') {
      throw new Error(`Quotation is not approved for selection. Current status: ${quote.status}`);
    }

    if (new Date(quote.valid_until).getTime() < Date.now()) {
      throw new Error('Quotation has expired.');
    }

    // Verify existing booking doesn't exist
    const existingBooking = await tx.queryOne(
      `SELECT id FROM bookings WHERE request_id = ?`,
      [quote.request_id]
    );
    if (existingBooking) {
      throw new Error('This request has already been booked.');
    }

    // Generate 6-digit completion OTP
    const rawCompletionOtp = String(Math.floor(100000 + Math.random() * 900000));
    const completionOtpHash = crypto
      .createHash('sha256')
      .update(rawCompletionOtp)
      .digest('hex');

    const bookingId = `book-${uuidv4().substring(0, 8)}`;
    const bookingStatus: BookingStatus = 'CONFIRMED';

    // Create booking
    await tx.execute(
      `INSERT INTO bookings (id, request_id, quotation_id, farmer_id, provider_id, status, payment_type, payment_status, total_amount, completion_otp_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        bookingId,
        quote.request_id,
        quote.id,
        quote.farmer_id,
        quote.provider_id,
        bookingStatus,
        paymentCondition,
        quote.total_amount,
        completionOtpHash,
      ]
    );

    // Append booking status history
    await tx.execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, note)
       VALUES (?, ?, NULL, ?, ?)`,
      [
        `bsh-${uuidv4().substring(0, 8)}`,
        bookingId,
        bookingStatus,
        `Booking confirmed with ${paymentCondition} payment. Completion OTP generated for farmer.`,
      ]
    );

    // Mark selected quotation as SELECTED
    await tx.execute(
      `UPDATE quotations SET status = 'SELECTED' WHERE id = ?`,
      [quote.id]
    );

    // Invalidate competing quotations
    await tx.execute(
      `UPDATE quotations SET status = 'EXPIRED' WHERE request_id = ? AND id != ?`,
      [quote.request_id, quote.id]
    );

    // Update request state
    await tx.execute(
      `UPDATE service_requests SET status = 'QUOTATION_SELECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [quote.request_id]
    );

    // Write domain event to transactional outbox
    await tx.execute(
      `INSERT INTO outbox_events (id, event_name, payload_json) VALUES (?, 'booking.confirmed', ?)`,
      [
        `evt-${uuidv4().substring(0, 8)}`,
        JSON.stringify({
          bookingId,
          requestId: quote.request_id,
          farmerId: quote.farmer_id,
          providerId: quote.provider_id,
          totalAmount: quote.total_amount,
          paymentCondition,
        }),
      ]
    );

    // Create Notification Intent for Farmer (with completion OTP)
    await tx.execute(
      `INSERT INTO notification_intents (id, recipient_phone, channel, message) VALUES (?, ?, 'SMS', ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        quote.farmer_id,
        `Your Tractor booking #${bookingId} is confirmed! Your service completion verification OTP is ${rawCompletionOtp}. Share this with the provider only after inspecting satisfactory work.`,
      ]
    );

    return {
      bookingId,
      status: bookingStatus,
      paymentType: paymentCondition,
      totalAmount: quote.total_amount,
      completionOtp: rawCompletionOtp,
    };
  });
}

// 5. Completion OTP Verification
export async function verifyWorkCompletion(
  db: DatabaseClient,
  bookingId: string,
  completionOtp: string,
  providerUserId: string
): Promise<{ success: boolean; newStatus: BookingStatus }> {
  const booking = await db.queryOne<{
    id: string;
    completion_otp_hash: string;
    status: BookingStatus;
    payment_type: PaymentCondition;
  }>(`SELECT id, completion_otp_hash, status, payment_type FROM bookings WHERE id = ?`, [
    bookingId,
  ]);

  if (!booking) {
    throw new Error('Booking not found.');
  }

  const inputHash = crypto.createHash('sha256').update(completionOtp.trim()).digest('hex');
  if (inputHash !== booking.completion_otp_hash) {
    throw new Error('Invalid completion OTP. Please verify the code with the farmer.');
  }

  const finalStatus: BookingStatus =
    booking.payment_type === 'CASH' ? 'CASH_CLOSED' : 'SETTLEMENT_RELEASED';

  await db.transaction(async tx => {
    await tx.execute(`UPDATE bookings SET status = ?, payment_status = 'PAID', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      finalStatus,
      bookingId,
    ]);

    await tx.execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)`,
      [
        `bsh-${uuidv4().substring(0, 8)}`,
        bookingId,
        booking.status,
        finalStatus,
        `Farmer completion OTP verified. Service closed successfully.`,
      ]
    );

    await tx.execute(
      `INSERT INTO outbox_events (id, event_name, payload_json) VALUES (?, 'booking.completed', ?)`,
      [
        `evt-${uuidv4().substring(0, 8)}`,
        JSON.stringify({ bookingId, finalStatus, timestamp: new Date().toISOString() }),
      ]
    );
  });

  return { success: true, newStatus: finalStatus };
}
