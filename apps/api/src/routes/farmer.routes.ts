import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@aat/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { matchProvidersForRequest } from '@aat/domain';
import { logger } from '@aat/observability';

export const farmerRouter = Router();

// Helper to get farmer profile id
async function getFarmerProfileId(userId: string): Promise<string> {
  const db = getDatabase();
  const profile = await db.queryOne<{ id: string }>(
    `SELECT id FROM farmer_profiles WHERE user_id = ?`,
    [userId]
  );
  if (!profile) {
    throw new AppError('FARMER_PROFILE_REQUIRED', 'Please complete your farmer profile first.', 400);
  }
  return profile.id;
}

// 1. Get Farmer's Farms
farmerRouter.get('/farms', requireAuth, requireRole('farmer'), async (req: Request, res: Response, next) => {
  try {
    const farmerId = await getFarmerProfileId(req.user!.userId);
    const db = getDatabase();
    const farms = await db.query(
      `SELECT f.*, d.district_name, d.state
       FROM farms f
       JOIN districts d ON f.district_id = d.id
       WHERE f.farmer_id = ?
       ORDER BY f.created_at DESC`,
      [farmerId]
    );

    res.json({
      success: true,
      data: farms,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Create Farm
farmerRouter.post('/farms', requireAuth, requireRole('farmer'), async (req: Request, res: Response, next) => {
  try {
    const farmerId = await getFarmerProfileId(req.user!.userId);
    const { farmName, districtId, address, latitude, longitude, surveyNumber, sizeAcres, soilType } = req.body;

    if (!farmName || !districtId || !address || latitude === undefined || longitude === undefined || !sizeAcres) {
      throw new AppError(
        'REQUEST_VALIDATION_FAILED',
        'Please review the highlighted farm details.',
        400,
        [
          { field: 'farmName', issue: 'Farm name is required' },
          { field: 'districtId', issue: 'Valid district is required' },
          { field: 'latitude', issue: 'Coordinates are required for dispatch matching' },
          { field: 'sizeAcres', issue: 'Farm size in acres is required' },
        ]
      );
    }

    const farmId = `farm-${uuidv4().substring(0, 8)}`;
    const db = getDatabase();
    await db.execute(
      `INSERT INTO farms (id, farmer_id, farm_name, district_id, address, latitude, longitude, survey_number, size_acres, soil_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [farmId, farmerId, farmName, districtId, address, latitude, longitude, surveyNumber || null, sizeAcres, soilType || 'Loam']
    );

    const farm = await db.queryOne(`SELECT * FROM farms WHERE id = ?`, [farmId]);

    res.status(201).json({
      success: true,
      data: farm,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Create Tractor Service Request
farmerRouter.post('/requests', requireAuth, requireRole('farmer'), async (req: Request, res: Response, next) => {
  try {
    const farmerId = await getFarmerProfileId(req.user!.userId);
    const {
      farmId,
      serviceId = 'srv-tractor',
      scheduledDate,
      timeWindow = '08:00 - 12:00',
      estimatedUnits,
      unitType = 'acre',
      implementRequired,
      soilCondition,
      notes,
    } = req.body;

    if (!farmId || !scheduledDate || !estimatedUnits || !implementRequired) {
      throw new AppError(
        'REQUEST_VALIDATION_FAILED',
        'Review the highlighted request fields.',
        400,
        [
          { field: 'farmId', issue: 'Farm selection is required' },
          { field: 'scheduledDate', issue: 'Scheduled date is required' },
          { field: 'estimatedUnits', issue: 'Estimated work units (acres/hours) required' },
          { field: 'implementRequired', issue: 'Implement requirement (e.g. Rotavator) required' },
        ]
      );
    }

    const db = getDatabase();

    // Verify farm ownership
    const farm = await db.queryOne<{ id: string }>(
      `SELECT id FROM farms WHERE id = ? AND farmer_id = ?`,
      [farmId, farmerId]
    );
    if (!farm) {
      throw new AppError('INVALID_FARM', 'The selected farm does not belong to your account.', 403);
    }

    const requestId = `req-${uuidv4().substring(0, 8)}`;

    await db.transaction(async tx => {
      // 1. Insert Request
      await tx.execute(
        `INSERT INTO service_requests (id, farmer_id, farm_id, service_id, status, scheduled_date, time_window, estimated_units, unit_type, notes)
         VALUES (?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?)`,
        [requestId, farmerId, farmId, serviceId, scheduledDate, timeWindow, estimatedUnits, unitType, notes || null]
      );

      // 2. Insert Field Values
      const fields = [
        { name: 'implementRequired', val: implementRequired },
        { name: 'soilCondition', val: soilCondition || 'Standard' },
      ];
      for (const f of fields) {
        await tx.execute(
          `INSERT INTO request_field_values (id, request_id, field_name, field_value) VALUES (?, ?, ?, ?)`,
          [`rfv-${uuidv4().substring(0, 8)}`, requestId, f.name, f.val]
        );
      }

      // 3. Insert Outbox Event
      await tx.execute(
        `INSERT INTO outbox_events (id, event_name, payload_json) VALUES (?, 'request.submitted', ?)`,
        [`evt-${uuidv4().substring(0, 8)}`, JSON.stringify({ requestId, farmerId, serviceId })]
      );
    });

    // In local development vertical slice, trigger matching immediately so user sees immediate results
    try {
      await matchProvidersForRequest(db, requestId);
    } catch (matchErr) {
      logger.error('Immediate matching evaluation error (worker will retry)', matchErr);
    }

    const createdRequest = await db.queryOne(
      `SELECT r.*, f.farm_name, f.address as farm_address, s.name as service_name
       FROM service_requests r
       JOIN farms f ON r.farm_id = f.id
       JOIN services s ON r.service_id = s.id
       WHERE r.id = ?`,
      [requestId]
    );

    res.status(201).json({
      success: true,
      data: createdRequest,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get Farmer's Requests
farmerRouter.get('/requests', requireAuth, requireRole('farmer'), async (req: Request, res: Response, next) => {
  try {
    const farmerId = await getFarmerProfileId(req.user!.userId);
    const db = getDatabase();

    const requests = await db.query(
      `SELECT r.*, f.farm_name, f.address, s.name as service_name,
              (SELECT count(*) FROM provider_invitations WHERE request_id = r.id) as invitations_count,
              (SELECT count(*) FROM quotations WHERE request_id = r.id AND status = 'APPROVED') as approved_quotes_count
       FROM service_requests r
       JOIN farms f ON r.farm_id = f.id
       JOIN services s ON r.service_id = s.id
       WHERE r.farmer_id = ?
       ORDER BY r.created_at DESC`,
      [farmerId]
    );

    res.json({
      success: true,
      data: requests,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 5. Get Single Request Details
farmerRouter.get('/requests/:id', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const request = await db.queryOne(
      `SELECT r.*, f.farm_name, f.latitude, f.longitude, f.address as farm_address, s.name as service_name,
              fp.full_name as farmer_name
       FROM service_requests r
       JOIN farms f ON r.farm_id = f.id
       JOIN services s ON r.service_id = s.id
       JOIN farmer_profiles fp ON r.farmer_id = fp.id
       WHERE r.id = ?`,
      [id]
    );

    if (!request) {
      throw new AppError('REQUEST_NOT_FOUND', 'Service request not found.', 404);
    }

    const fieldValues = await db.query(
      `SELECT field_name, field_value FROM request_field_values WHERE request_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...request,
        fieldValues,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});
