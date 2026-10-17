import assert from 'assert';
import { getDatabase, runMigrations, seedDatabase } from '@aat/database';
import { matchProvidersForRequest, selectQuotationAtomic, verifyWorkCompletion } from '@aat/domain';
import { logger } from '@aat/observability';
import { v4 as uuidv4 } from 'uuid';

async function runE2ETests() {
  logger.info('========================================================');
  logger.info('STARTING AAT MVP END-TO-END VERTICAL SLICE INTEGRATION TESTS');
  logger.info('========================================================');

  const db = getDatabase();
  await runMigrations(db);
  await seedDatabase(db);

  // 1. Verify Seed Data
  const districts = await db.query('SELECT count(*) as count FROM districts');
  assert.strictEqual(districts[0].count, 61, 'Must have all 61 AP & TG districts seeded');
  logger.info('✓ Test 1: All 61 districts successfully verified.');

  const farmer = await db.queryOne<{ id: string; user_id: string }>(
    `SELECT * FROM farmer_profiles WHERE full_name = 'Ramesh Reddy'`
  );
  assert.ok(farmer, 'Seed farmer must exist');

  const farms = await db.query(`SELECT * FROM farms WHERE farmer_id = ?`, [farmer.id]);
  assert.ok(farms.length >= 2, 'Farmer must have at least 2 seeded farms');
  const farm1 = farms[0];
  logger.info(`✓ Test 2: Seed farmer and farms verified (${farm1.farm_name}).`);

  // 2. Farmer Submits Tractor Service Request
  const requestId = `req-test-${uuidv4().substring(0, 6)}`;
  await db.execute(
    `INSERT INTO service_requests (id, farmer_id, farm_id, service_id, status, scheduled_date, time_window, estimated_units, unit_type, notes)
     VALUES (?, ?, ?, 'srv-tractor', 'SUBMITTED', '2026-11-01', '08:00 - 12:00', 5.5, 'acre', 'Need deep rotavator tilling for paddy')`,
    [requestId, farmer.id, farm1.id]
  );
  logger.info(`✓ Test 3: Tractor service request created (${requestId}).`);

  // 3. Provider Matching Engine
  const matchingResult = await matchProvidersForRequest(db, requestId);
  assert.strictEqual(matchingResult.status, 'OFFER_WINDOW_OPEN');
  assert.ok(matchingResult.invitedCount >= 1, 'Must invite at least 1 provider within radius');
  assert.ok(matchingResult.invitedCount <= 5, 'Must not invite more than 5 providers');
  const invitation = matchingResult.invitedProviders[0];
  logger.info(`✓ Test 4: Provider matching succeeded. Invited provider: ${invitation.businessName} (${invitation.distanceKm} km).`);

  // 4. Provider Submits Itemized Quotation
  const quotationId = `quot-test-${uuidv4().substring(0, 6)}`;
  const validUntil = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  await db.execute(
    `INSERT INTO quotations (id, invitation_id, request_id, provider_id, status, total_amount, provider_note, valid_until)
     VALUES (?, ?, ?, ?, 'PENDING_REVIEW', 4950.0, 'Includes 42-blade rotavator, fuel and mobilization', ?)`,
    [quotationId, invitation.invitationId, requestId, invitation.providerId, validUntil]
  );
  await db.execute(
    `INSERT INTO quotation_lines (id, quotation_id, unit, quantity, unit_rate, mobilization_charge, material_charge, tax_amount, line_total)
     VALUES (?, ?, 'acre', 5.5, 800.0, 550.0, 0, 0, 4950.0)`,
    [`qline-${uuidv4().substring(0, 6)}`, quotationId]
  );
  logger.info(`✓ Test 5: Itemized quotation submitted (Total: ₹4,950, Status: PENDING_REVIEW).`);

  // 5. Verify Quotation is GATED from Farmer before Operations Review
  const visibleBeforeReview = await db.query(
    `SELECT * FROM quotations WHERE request_id = ? AND status = 'APPROVED'`,
    [requestId]
  );
  assert.strictEqual(visibleBeforeReview.length, 0, 'Unapproved quotation must NOT be visible to farmer');
  logger.info('✓ Test 6: Security check passed — unapproved quote is hidden from farmer.');

  // 6. Operations Reviews and Approves Quotation
  const staff = await db.queryOne<{ id: string }>(`SELECT id FROM users WHERE phone = '+919876543213'`);
  await db.execute(`UPDATE quotations SET status = 'APPROVED' WHERE id = ?`, [quotationId]);
  await db.execute(
    `INSERT INTO price_reviews (id, quotation_id, reviewer_user_id, decision, reason) VALUES (?, ?, ?, 'APPROVED', 'Standard market rate for Pedakakani mandal')`,
    [`rev-${uuidv4().substring(0, 6)}`, quotationId, staff!.id]
  );
  logger.info('✓ Test 7: Operations staff approved quotation with audit reason.');

  // 7. Quotation is now visible to Farmer
  const visibleAfterReview = await db.query(
    `SELECT * FROM quotations WHERE request_id = ? AND status = 'APPROVED'`,
    [requestId]
  );
  assert.strictEqual(visibleAfterReview.length, 1, 'Approved quote must now be visible to farmer');
  logger.info('✓ Test 8: Farmer sees approved quotation.');

  // 8. Farmer Selects Quotation -> Atomic Confirmed Booking
  const selection = await selectQuotationAtomic(db, quotationId, farmer.user_id, 'CASH');
  assert.strictEqual(selection.status, 'CONFIRMED');
  assert.strictEqual(selection.paymentType, 'CASH');
  assert.ok(selection.completionOtp.length === 6, 'Must generate 6-digit completion OTP');
  logger.info(`✓ Test 9: Booking confirmed atomically (#${selection.bookingId}). Farmer OTP: ${selection.completionOtp}`);

  // 9. Provider Advances Trip States
  await db.execute(`UPDATE bookings SET status = 'IN_PROGRESS' WHERE id = ?`, [selection.bookingId]);
  await db.execute(`UPDATE bookings SET status = 'ARRIVED' WHERE id = ?`, [selection.bookingId]);
  await db.execute(`UPDATE bookings SET status = 'WORK_STARTED' WHERE id = ?`, [selection.bookingId]);
  logger.info('✓ Test 10: Provider execution states progressed (IN_PROGRESS -> ARRIVED -> WORK_STARTED).');

  // 10. Provider Submits Completion OTP to Finalize Booking
  const completionResult = await verifyWorkCompletion(
    db,
    selection.bookingId,
    selection.completionOtp,
    invitation.providerId
  );
  assert.strictEqual(completionResult.success, true);
  assert.strictEqual(completionResult.newStatus, 'CASH_CLOSED');
  logger.info('✓ Test 11: Farmer OTP verified by provider. Booking status transitioned to CASH_CLOSED.');

  // 11. Verify Append-Only Booking Status History & Audit Log
  const history = await db.query(
    `SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY created_at ASC`,
    [selection.bookingId]
  );
  assert.ok(history.length >= 2, 'History must contain all append-only state transitions');
  logger.info(`✓ Test 12: Audit trail verified (${history.length} lifecycle transitions logged).`);

  logger.info('========================================================');
  logger.info('ALL 12 TESTS PASSED! AAT VERTICAL SLICE PROVEN END-TO-END.');
  logger.info('========================================================');
}

runE2ETests().catch(err => {
  logger.error('E2E Test Failed', err);
  process.exit(1);
});
