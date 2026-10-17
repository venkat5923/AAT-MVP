import { Router, Request, Response } from 'express';
import { getDatabase } from '@aat/database';
import { AppError } from '../middleware/error';

export const catalogRouter = Router();

// 1. Get Districts
catalogRouter.get('/districts', async (req: Request, res: Response, next) => {
  try {
    const { state, search } = req.query;
    const db = getDatabase();

    let sql = `SELECT id, state, district_name, district_code FROM districts`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (state && typeof state === 'string') {
      conditions.push(`LOWER(state) = LOWER(?)`);
      params.push(state.trim());
    }

    if (search && typeof search === 'string') {
      conditions.push(`LOWER(district_name) LIKE LOWER(?)`);
      params.push(`%${search.trim()}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY state ASC, district_name ASC`;
    const districts = await db.query(sql, params);

    res.json({
      success: true,
      data: districts,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get Services
catalogRouter.get('/services', async (req: Request, res: Response, next) => {
  try {
    const db = getDatabase();
    const services = await db.query(
      `SELECT id, code, name, description, is_active FROM services WHERE is_active = 1`
    );

    res.json({
      success: true,
      data: services,
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get Service Details with Dynamic Fields
catalogRouter.get('/services/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const service = await db.queryOne(
      `SELECT id, code, name, description, is_active FROM services WHERE id = ?`,
      [id]
    );

    if (!service) {
      throw new AppError('SERVICE_NOT_FOUND', 'The requested service was not found.', 404);
    }

    const fields = await db.query(
      `SELECT id, field_name, field_label, field_type, is_required, options_json, display_order
       FROM service_fields
       WHERE service_id = ?
       ORDER BY display_order ASC`,
      [id]
    );

    const parsedFields = fields.map(f => ({
      ...f,
      options: f.options_json ? JSON.parse(f.options_json) : null,
    }));

    res.json({
      success: true,
      data: {
        ...service,
        fields: parsedFields,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});
