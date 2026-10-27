import { DatabaseClient, getDatabase } from './db';
import { runMigrations } from './schema';
import { logger } from '@aat/observability';
import crypto from 'crypto';

export const AP_DISTRICTS = [
  'Alluri Sitharama Raju',
  'Anakapalli',
  'Ananthapuramu',
  'Annamayya',
  'Bapatla',
  'Chittoor',
  'Dr. B.R. Ambedkar Konaseema',
  'East Godavari',
  'Eluru',
  'Guntur',
  'Kakinada',
  'Krishna',
  'Kurnool',
  'Nandyal',
  'NTR',
  'Palnadu',
  'Parvathipuram Manyam',
  'Prakasam',
  'Sri Potti Sriramulu Nellore',
  'Sri Sathya Sai',
  'Srikakulam',
  'Tirupati',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',
  'YSR Kadapa',
];

export const TG_DISTRICTS = [
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hanamkonda',
  'Hyderabad',
  'Jagtial',
  'Jangaon',
  'Jayashankar Bhupalpally',
  'Jogulamba Gadwal',
  'Kamareddy',
  'Karimnagar',
  'Khammam',
  'Kumuram Bheem Asifabad',
  'Mahabubabad',
  'Mahabubnagar',
  'Mancherial',
  'Medak',
  'Medchal-Malkajgiri',
  'Mulugu',
  'Nagarkurnool',
  'Nalgonda',
  'Narayanpet',
  'Nirmal',
  'Nizamabad',
  'Peddapalli',
  'Rajanna Sircilla',
  'Ranga Reddy',
  'Sangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
  'Warangal',
  'Yadadri Bhuvanagiri',
  'GHMC Central',
  'Secunderabad',
];

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export async function seedDatabase(db: DatabaseClient): Promise<void> {
  logger.info('Starting deterministic seed process...');

  // 1. Seed Roles
  const roles = [
    { id: 'role-farmer', name: 'farmer', description: 'Farmer requesting agricultural services' },
    { id: 'role-provider', name: 'provider', description: 'Equipment owner offering agricultural services' },
    { id: 'role-staff', name: 'staff', description: 'Akanksha operations reviewer' },
    { id: 'role-admin', name: 'admin', description: 'System administrator' },
  ];
  for (const role of roles) {
    await db.execute(
      `INSERT OR REPLACE INTO roles (id, name, description) VALUES (?, ?, ?)`,
      [role.id, role.name, role.description]
    );
  }

  // 2. Seed All 61 Districts (26 in AP + 35 in TG = 61 total)
  let districtCounter = 1;
  const districtMap: Record<string, string> = {};

  for (const name of AP_DISTRICTS) {
    const code = `AP-${String(districtCounter).padStart(3, '0')}`;
    const id = `dist-ap-${districtCounter}`;
    await db.execute(
      `INSERT OR REPLACE INTO districts (id, state, district_name, district_code) VALUES (?, ?, ?, ?)`,
      [id, 'Andhra Pradesh', name, code]
    );
    districtMap[name] = id;
    districtCounter++;
  }

  for (const name of TG_DISTRICTS) {
    const code = `TG-${String(districtCounter).padStart(3, '0')}`;
    const id = `dist-tg-${districtCounter}`;
    await db.execute(
      `INSERT OR REPLACE INTO districts (id, state, district_name, district_code) VALUES (?, ?, ?, ?)`,
      [id, 'Telangana', name, code]
    );
    districtMap[name] = id;
    districtCounter++;
  }
  logger.info(`Seeded ${districtCounter - 1} reference districts across AP & Telangana.`);

  // 3. Seed Tractor Service
  const serviceId = 'srv-tractor';
  await db.execute(
    `INSERT OR REPLACE INTO services (id, code, name, description, is_active) VALUES (?, ?, ?, ?, ?)`,
    [serviceId, 'TRACTOR', 'Tractor Mechanization Services', 'Plowing, harrowing, tilling, rotavating and land preparation', 1]
  );

  // Seed Service Fields
  const fields = [
    {
      id: 'field-implement',
      name: 'implementRequired',
      label: 'Implement Required',
      type: 'select',
      options: JSON.stringify(['Rotavator', 'MB Plough', 'Disc Harrow', 'Cultivator', 'Laser Leveler']),
      order: 1,
    },
    {
      id: 'field-soil',
      name: 'soilCondition',
      label: 'Soil / Field Condition',
      type: 'select',
      options: JSON.stringify(['Dry Loam', 'Wet Clay / Paddy', 'Sandy / Red Soil', 'Hard Crusted / Rocky']),
      order: 2,
    },
    {
      id: 'field-road',
      name: 'accessRoadCondition',
      label: 'Field Access Road',
      type: 'select',
      options: JSON.stringify(['Paved / Concrete Road', 'Broad Bund Trail', 'Mud / Narrow Approach']),
      order: 3,
    },
  ];

  for (const f of fields) {
    await db.execute(
      `INSERT OR REPLACE INTO service_fields (id, service_id, field_name, field_label, field_type, is_required, options_json, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.id, serviceId, f.name, f.label, f.type, 1, f.options, f.order]
    );
  }

  // Seed Service Area Status for seeded districts
  for (const distId of Object.values(districtMap)) {
    await db.execute(
      `INSERT OR REPLACE INTO service_area_status (id, district_id, service_id, status) VALUES (?, ?, ?, ?)`,
      [`area-${distId}`, distId, serviceId, 'BOOKABLE']
    );
  }

  // 4. Seed Deterministic Users
  const nelloreId = districtMap['Sri Potti Sriramulu Nellore'] || districtMap['Guntur'];

  // Farmer: Bhanu Kapa (+919876543210)
  const farmerUserId = 'usr-farmer-bhanu';
  await db.execute(`INSERT OR REPLACE INTO users (id, phone, status) VALUES (?, ?, ?)`, [
    farmerUserId,
    '+919876543210',
    'ACTIVE',
  ]);
  await db.execute(`INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
    farmerUserId,
    'role-farmer',
  ]);
  const farmerProfileId = 'prof-farmer-bhanu';
  await db.execute(
    `INSERT OR REPLACE INTO farmer_profiles (id, user_id, full_name, preferred_language, district_id) VALUES (?, ?, ?, ?, ?)`,
    [farmerProfileId, farmerUserId, 'Bhanu Kapa', 'te', nelloreId]
  );

  // Farmer's Farms
  const farm1Id = 'farm-dundigam-paddy';
  await db.execute(
    `INSERT OR REPLACE INTO farms (id, farmer_id, farm_name, district_id, address, latitude, longitude, survey_number, size_acres, soil_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm1Id,
      farmerProfileId,
      'Dundigam East Paddy Field',
      nelloreId,
      'Dundigam Village, Nellore District',
      14.4426,
      79.9865,
      'SY-142/B',
      5.5,
      'Wet Clay / Paddy',
    ]
  );

  const farm2Id = 'farm-nellore-cotton';
  await db.execute(
    `INSERT OR REPLACE INTO farms (id, farmer_id, farm_name, district_id, address, latitude, longitude, survey_number, size_acres, soil_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm2Id,
      farmerProfileId,
      'Nellore Chilli & Paddy Land',
      nelloreId,
      'Dundigam Rural, Nellore District',
      14.4500,
      79.9900,
      'SY-88/1',
      8.0,
      'Black Cotton Soil',
    ]
  );

  // Provider 1: Kapa Nani (+919876543211)
  const p1UserId = 'usr-prov-kapa-nani';
  await db.execute(`INSERT OR REPLACE INTO users (id, phone, status) VALUES (?, ?, ?)`, [
    p1UserId,
    '+919876543211',
    'ACTIVE',
  ]);
  await db.execute(`INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
    p1UserId,
    'role-provider',
  ]);
  const p1ProfileId = 'prof-prov-kapa-nani';
  await db.execute(
    `INSERT OR REPLACE INTO provider_profiles (id, user_id, business_name, contact_person, is_verified, kyc_status, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p1ProfileId, p1UserId, 'Kapa Nani Agri Mechanization', 'Kapa Nani', 1, 'VERIFIED', 4.9]
  );
  await db.execute(
    `INSERT OR REPLACE INTO provider_services (id, provider_id, service_id, base_latitude, base_longitude, service_radius_km, is_available, capacity, equipment_details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'psrv-nani-tractor',
      p1ProfileId,
      serviceId,
      14.445,
      79.988,
      30.0,
      1,
      2,
      'Mahindra 575 DI (45 HP) with 42-blade Rotavator and MB Plough',
    ]
  );

  // Provider 2: Bhanu Naidu (+919876543212)
  const p2UserId = 'usr-prov-bhanu-naidu';
  await db.execute(`INSERT OR REPLACE INTO users (id, phone, status) VALUES (?, ?, ?)`, [
    p2UserId,
    '+919876543212',
    'ACTIVE',
  ]);
  await db.execute(`INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
    p2UserId,
    'role-provider',
  ]);
  const p2ProfileId = 'prof-prov-bhanu-naidu';
  await db.execute(
    `INSERT OR REPLACE INTO provider_profiles (id, user_id, business_name, contact_person, is_verified, kyc_status, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p2ProfileId, p2UserId, 'Bhanu Naidu Drone Agri Services', 'Bhanu Naidu', 1, 'VERIFIED', 4.8]
  );
  await db.execute(
    `INSERT OR REPLACE INTO provider_services (id, provider_id, service_id, base_latitude, base_longitude, service_radius_km, is_available, capacity, equipment_details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'psrv-naidu-drone',
      p2ProfileId,
      serviceId,
      14.448,
      79.982,
      35.0,
      1,
      3,
      'DJI Agras T40 40L Precision Spraying Drone',
    ]
  );

  // Operations Staff (+919876543213)
  const staffUserId = 'usr-staff-ops';
  await db.execute(`INSERT OR REPLACE INTO users (id, phone, status) VALUES (?, ?, ?)`, [
    staffUserId,
    '+919876543213',
    'ACTIVE',
  ]);
  await db.execute(`INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
    staffUserId,
    'role-staff',
  ]);

  // System Admin (+919876543214)
  const adminUserId = 'usr-admin';
  await db.execute(`INSERT OR REPLACE INTO users (id, phone, status) VALUES (?, ?, ?)`, [
    adminUserId,
    '+919876543214',
    'ACTIVE',
  ]);
  await db.execute(`INSERT OR REPLACE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
    adminUserId,
    'role-admin',
  ]);

  logger.info('Deterministic seed data populated successfully.');
}

// Standalone execution script
if (require.main === module) {
  const db = getDatabase();
  runMigrations(db)
    .then(() => seedDatabase(db))
    .then(() => {
      logger.info('Database migration and seeding completed.');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Failed to migrate/seed database', err);
      process.exit(1);
    });
}
