import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@aat/config';
import { UserRole, UserSession } from '@aat/contracts';
import { getDatabase } from '@aat/database';

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      roles: decoded.roles || [],
      profileId: decoded.profileId,
    };
    next();
  } catch (err) {
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'You must provide a valid Bearer token to access this resource.',
        details: [],
        correlationId: req.correlationId,
      },
    });
    return;
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'You must be authenticated to perform this action.',
          details: [],
          correlationId: req.correlationId,
        },
      });
      return;
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
          details: [],
          correlationId: req.correlationId,
        },
      });
      return;
    }

    next();
  };
}
