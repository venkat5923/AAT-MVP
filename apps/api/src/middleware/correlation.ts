import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId } from '@aat/observability';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerCorrelationId = req.header('X-Correlation-ID');
  const correlationId = headerCorrelationId || generateCorrelationId();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
}
