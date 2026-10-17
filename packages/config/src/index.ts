import dotenv from 'dotenv';
import path from 'path';

// Load from root .env if available
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  webPort: number;
  database: {
    type: 'sqlite' | 'postgres';
    url?: string;
    file: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    devOtpAutoApprove: boolean;
    devOtpCode: string;
    otpExpiresInMinutes: number;
    otpMaxAttempts: number;
  };
  marketplace: {
    providerLimit: number;
    offerWindowMinutes: number;
    defaultProviderRadiusKm: number;
  };
  adapters: {
    paymentGateway: string;
    smsGateway: string;
    mapProvider: string;
  };
}

const workspaceRoot = path.resolve(__dirname, '../../../');
const resolvedDbFile = process.env.DATABASE_FILE
  ? (path.isAbsolute(process.env.DATABASE_FILE) ? process.env.DATABASE_FILE : path.resolve(workspaceRoot, process.env.DATABASE_FILE))
  : path.resolve(workspaceRoot, 'aat_dev.sqlite');

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  webPort: parseInt(process.env.WEB_PORT || '3000', 10),
  database: {
    type: (process.env.DATABASE_TYPE as 'sqlite' | 'postgres') || (process.env.DATABASE_URL ? 'postgres' : 'sqlite'),
    url: process.env.DATABASE_URL,
    file: resolvedDbFile,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'aat_default_dev_secret_key_123456789',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    devOtpAutoApprove: process.env.DEV_OTP_AUTO_APPROVE === 'true',
    devOtpCode: process.env.DEV_OTP_CODE || '123456',
    otpExpiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '5', 10),
    otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),
  },
  marketplace: {
    providerLimit: parseInt(process.env.MATCHING_PROVIDER_LIMIT || '5', 10),
    offerWindowMinutes: parseInt(process.env.OFFER_WINDOW_MINUTES || '60', 10),
    defaultProviderRadiusKm: parseFloat(process.env.DEFAULT_PROVIDER_RADIUS_KM || '25'),
  },
  adapters: {
    paymentGateway: process.env.PAYMENT_GATEWAY_ADAPTER || 'simulated',
    smsGateway: process.env.SMS_GATEWAY_ADAPTER || 'dev_sink',
    mapProvider: process.env.MAP_PROVIDER_ADAPTER || 'haversine_test',
  },
};
