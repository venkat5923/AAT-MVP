import { v4 as uuidv4 } from 'uuid';

export function generateCorrelationId(): string {
  return `aat-${uuidv4().substring(0, 8)}`;
}

const SENSITIVE_KEYS = ['otp', 'password', 'token', 'authorization', 'secret', 'challenge_hash'];

export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      result[key] = '***REDACTED***';
    } else if (lowerKey === 'phone' && typeof value === 'string' && value.length >= 10) {
      result[key] = value.slice(0, 3) + '****' + value.slice(-3);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export interface LogContext {
  correlationId?: string;
  actorId?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  [key: string]: any;
}

export const logger = {
  info(message: string, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.log(JSON.stringify(payload));
  },
  warn(message: string, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.warn(JSON.stringify(payload));
  },
  error(message: string, error?: any, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.error(JSON.stringify(payload));
  },
  audit(action: string, context: LogContext & { reason?: string }) {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      action,
      ...redactSensitiveData(context),
    };
    console.log(JSON.stringify(payload));
  },
};
