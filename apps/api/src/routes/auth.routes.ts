import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@aat/database';
import { config } from '@aat/config';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { logger } from '@aat/observability';

export const authRouter = Router();

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+')) {
    return `+91${cleaned.replace(/^0+/, '')}`;
  }
  return cleaned;
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

// 1. Request OTP
authRouter.post('/otp/request', async (req: Request, res: Response, next) => {
  try {
    const { phone, role } = req.body;
    if (!phone || typeof phone !== 'string' || phone.length < 10) {
      throw new AppError(
        'REQUEST_VALIDATION_FAILED',
        'A valid mobile phone number is required.',
        400,
        [{ field: 'phone', issue: 'Invalid phone number format' }]
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const db = getDatabase();

    // Check rate limit (max 3 challenges in last 5 minutes)
    const recentChallenges = await db.queryOne<{ count: number }>(
      `SELECT count(*) as count FROM otp_challenges
       WHERE phone = ? AND created_at > datetime('now', '-5 minutes')`,
      [normalizedPhone]
    );

    if (recentChallenges && recentChallenges.count >= 5) {
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        'Too many OTP requests. Please wait a few minutes before trying again.',
        429
      );
    }

    // Generate 6-digit OTP
    const rawOtp = config.auth.devOtpAutoApprove ? config.auth.devOtpCode : String(Math.floor(100000 + Math.random() * 900000));
    const challengeHash = hashOtp(rawOtp);
    const challengeId = `otp-${uuidv4().substring(0, 8)}`;
    const expiresAt = new Date(Date.now() + config.auth.otpExpiresInMinutes * 60 * 1000).toISOString();

    await db.execute(
      `INSERT INTO otp_challenges (id, phone, challenge_hash, attempts_count, max_attempts, expires_at)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [challengeId, normalizedPhone, challengeHash, config.auth.otpMaxAttempts, expiresAt]
    );

    // Save notification intent
    await db.execute(
      `INSERT INTO notification_intents (id, recipient_phone, channel, message) VALUES (?, ?, 'SMS', ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        normalizedPhone,
        `Your Akanksha Agree Tech verification code is: ${rawOtp}. Valid for ${config.auth.otpExpiresInMinutes} minutes.`,
      ]
    );

    logger.info(`OTP generated for ${normalizedPhone}`, {
      correlationId: req.correlationId,
      challengeId,
    });

    res.json({
      success: true,
      data: {
        message: 'OTP challenge generated successfully.',
        phone: normalizedPhone,
        expiresInMinutes: config.auth.otpExpiresInMinutes,
        // In development adapter mode, provide the test OTP for seamless QA
        devOtp: config.auth.devOtpAutoApprove ? rawOtp : undefined,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Verify OTP
authRouter.post('/otp/verify', async (req: Request, res: Response, next) => {
  try {
    const { phone, otp, role = 'farmer' } = req.body;
    if (!phone || !otp) {
      throw new AppError(
        'REQUEST_VALIDATION_FAILED',
        'Both phone and 6-digit OTP are required.',
        400,
        [
          { field: 'phone', issue: 'Phone is required' },
          { field: 'otp', issue: 'OTP is required' },
        ]
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const db = getDatabase();

    // Find latest active challenge
    const challenge = await db.queryOne<{
      id: string;
      challenge_hash: string;
      attempts_count: number;
      max_attempts: number;
      expires_at: string;
      verified_at: string | null;
    }>(
      `SELECT id, challenge_hash, attempts_count, max_attempts, expires_at, verified_at
       FROM otp_challenges
       WHERE phone = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedPhone]
    );

    const isDevBypass = config.auth.devOtpAutoApprove && otp === config.auth.devOtpCode;

    if (!challenge && !isDevBypass) {
      throw new AppError('OTP_NOT_FOUND', 'No active OTP challenge found. Please request a new OTP.', 404);
    }

    if (challenge && !isDevBypass) {
      if (challenge.verified_at) {
        throw new AppError('OTP_ALREADY_USED', 'This OTP has already been verified. Request a new one.', 400);
      }

      if (new Date(challenge.expires_at).getTime() < Date.now()) {
        throw new AppError('OTP_EXPIRED', 'This OTP has expired. Please request a new OTP.', 400);
      }

      if (challenge.attempts_count >= challenge.max_attempts) {
        throw new AppError(
          'OTP_MAX_ATTEMPTS_EXCEEDED',
          'Maximum verification attempts exceeded. Please request a new OTP.',
          429
        );
      }

      const inputHash = hashOtp(otp);
      if (inputHash !== challenge.challenge_hash) {
        await db.execute(
          `UPDATE otp_challenges SET attempts_count = attempts_count + 1 WHERE id = ?`,
          [challenge.id]
        );
        throw new AppError('INVALID_OTP', 'Incorrect OTP entered. Please try again.', 401);
      }

      // Mark challenge verified
      await db.execute(
        `UPDATE otp_challenges SET verified_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [challenge.id]
      );
    }

    // Find or create user
    let user = await db.queryOne<{ id: string; phone: string; status: string }>(
      `SELECT id, phone, status FROM users WHERE phone = ?`,
      [normalizedPhone]
    );

    if (!user) {
      const newUserId = `usr-${uuidv4().substring(0, 8)}`;
      await db.execute(`INSERT INTO users (id, phone, status) VALUES (?, ?, 'ACTIVE')`, [
        newUserId,
        normalizedPhone,
      ]);

      // Assign requested role
      const roleRecord = await db.queryOne<{ id: string }>(
        `SELECT id FROM roles WHERE name = ?`,
        [role]
      );
      if (roleRecord) {
        await db.execute(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
          newUserId,
          roleRecord.id,
        ]);
      }

      // Create default profile based on role
      if (role === 'farmer') {
        await db.execute(
          `INSERT INTO farmer_profiles (id, user_id, full_name, preferred_language) VALUES (?, ?, ?, 'te')`,
          [`prof-${uuidv4().substring(0, 8)}`, newUserId, 'New Farmer']
        );
      } else if (role === 'provider') {
        await db.execute(
          `INSERT INTO provider_profiles (id, user_id, business_name, contact_person, is_verified) VALUES (?, ?, ?, ?, 1)`,
          [`prof-${uuidv4().substring(0, 8)}`, newUserId, 'New Equipment Services', 'Owner']
        );
      }

      user = { id: newUserId, phone: normalizedPhone, status: 'ACTIVE' };
    }

    // Fetch user roles
    const roles = await db.query<{ name: string }>(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [user.id]
    );
    const roleNames = roles.map(r => r.name);

    // Fetch profile id if any
    let profileId: string | undefined;
    if (roleNames.includes('farmer')) {
      const prof = await db.queryOne<{ id: string }>(
        `SELECT id FROM farmer_profiles WHERE user_id = ?`,
        [user.id]
      );
      profileId = prof?.id;
    } else if (roleNames.includes('provider')) {
      const prof = await db.queryOne<{ id: string }>(
        `SELECT id FROM provider_profiles WHERE user_id = ?`,
        [user.id]
      );
      profileId = prof?.id;
    }

    // Issue JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        roles: roleNames,
        profileId,
      },
      config.auth.jwtSecret,
      { expiresIn: '12h' }
    );

    // Record session
    const sessionId = `ses-${uuidv4().substring(0, 8)}`;
    await db.execute(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+7 days'))`,
      [sessionId, user.id, hashOtp(token)]
    );

    logger.audit('USER_AUTHENTICATED', {
      correlationId: req.correlationId,
      actorId: user.id,
      actorRole: roleNames.join(','),
      targetId: user.id,
      targetType: 'user',
      reason: 'Phone OTP verified',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          roles: roleNames,
          profileId,
        },
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Current User Profile
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const db = getDatabase();
    const user = await db.queryOne<any>(`SELECT id, phone, status FROM users WHERE id = ?`, [
      req.user!.userId,
    ]);

    let profile: any = null;
    if (req.user!.roles.includes('farmer')) {
      profile = await db.queryOne(`SELECT * FROM farmer_profiles WHERE user_id = ?`, [user.id]);
    } else if (req.user!.roles.includes('provider')) {
      profile = await db.queryOne(`SELECT * FROM provider_profiles WHERE user_id = ?`, [user.id]);
    }

    res.json({
      success: true,
      data: {
        ...user,
        roles: req.user!.roles,
        profile,
      },
      correlationId: req.correlationId,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Permissions Check
authRouter.get('/me/permissions', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      userId: req.user!.userId,
      roles: req.user!.roles,
      canRequestTractor: req.user!.roles.includes('farmer'),
      canSubmitQuotation: req.user!.roles.includes('provider'),
      canReviewPrices: req.user!.roles.includes('staff') || req.user!.roles.includes('admin'),
      canManageCatalog: req.user!.roles.includes('admin'),
    },
    correlationId: req.correlationId,
  });
});
