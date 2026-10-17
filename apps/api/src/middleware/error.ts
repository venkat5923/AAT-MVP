import { Request, Response, NextFunction } from 'express';
import { logger } from '@aat/observability';
import { ApiErrorResponse } from '@aat/contracts';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details: Array<{ field?: string; issue: string }> = []
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = req.correlationId || 'aat-unknown';

  if (err instanceof AppError) {
    logger.warn(`Handled application error: ${err.message}`, {
      correlationId,
      code: err.code,
      statusCode: err.statusCode,
    });

    const response: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        correlationId,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  logger.error(`Unhandled error processing request ${req.method} ${req.url}`, err, {
    correlationId,
  });

  const response: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please contact support.',
      details: [{ issue: err?.message || 'Server error' }],
      correlationId,
    },
  };
  res.status(500).json(response);
}
