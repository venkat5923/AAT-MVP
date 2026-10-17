import { DatabaseClient } from './db';
import { logger } from '@aat/observability';

export const SCHEMA_SQL = `
-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. roles
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- 3. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. otp_challenges
CREATE TABLE IF NOT EXISTS otp_challenges (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  challenge_hash TEXT NOT NULL,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  expires_at TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. consents
CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. farmer_profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'te',
  district_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. farms
CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  district_id TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  survey_number TEXT,
  size_acres REAL NOT NULL,
  soil_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id) ON DELETE CASCADE
);

-- 9. provider_profiles
CREATE TABLE IF NOT EXISTS provider_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  kyc_status TEXT NOT NULL DEFAULT 'PENDING',
  rating REAL DEFAULT 5.0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. provider_services
CREATE TABLE IF NOT EXISTS provider_services (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  base_latitude REAL NOT NULL,
  base_longitude REAL NOT NULL,
  service_radius_km REAL NOT NULL DEFAULT 25.0,
  is_available INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 1,
  equipment_details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, service_id),
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

-- 11. services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. service_fields
CREATE TABLE IF NOT EXISTS service_fields (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 1,
  options_json TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 13. districts
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  district_name TEXT NOT NULL,
  district_code TEXT UNIQUE NOT NULL
);

-- 14. service_area_status
CREATE TABLE IF NOT EXISTS service_area_status (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'BOOKABLE',
  UNIQUE(district_id, service_id),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 15. service_requests
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  scheduled_date TEXT NOT NULL,
  time_window TEXT NOT NULL,
  estimated_units REAL NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'acre',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 16. request_field_values
CREATE TABLE IF NOT EXISTS request_field_values (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- 17. provider_invitations
CREATE TABLE IF NOT EXISTS provider_invitations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  distance_km REAL NOT NULL,
  offer_expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(request_id, provider_id),
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

-- 18. quotations
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  invitation_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  total_amount REAL NOT NULL,
  provider_note TEXT,
  valid_until TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES provider_invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

-- 19. quotation_lines
CREATE TABLE IF NOT EXISTS quotation_lines (
  id TEXT PRIMARY KEY,
  quotation_id TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_rate REAL NOT NULL,
  mobilization_charge REAL NOT NULL DEFAULT 0,
  material_charge REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- 20. price_reviews
CREATE TABLE IF NOT EXISTS price_reviews (
  id TEXT PRIMARY KEY,
  quotation_id TEXT NOT NULL,
  reviewer_user_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
);

-- 21. bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  quotation_id TEXT UNIQUE NOT NULL,
  farmer_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  payment_type TEXT NOT NULL DEFAULT 'CASH',
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  total_amount REAL NOT NULL,
  completion_otp_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id),
  FOREIGN KEY (quotation_id) REFERENCES quotations(id),
  FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id),
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id)
);

-- 22. booking_status_history (append-only)
CREATE TABLE IF NOT EXISTS booking_status_history (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by_user_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 23. audit_events (append-only)
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT,
  correlation_id TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 24. outbox_events
CREATE TABLE IF NOT EXISTS outbox_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT
);

-- 25. notification_intents
CREATE TABLE IF NOT EXISTS notification_intents (
  id TEXT PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'SMS',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

export async function runMigrations(db: DatabaseClient): Promise<void> {
  logger.info('Applying database schema migrations (25 core tables)...');
  const statements = SCHEMA_SQL.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement);
  }
  logger.info('Database schema migrations applied successfully.');
}
