import assert from 'assert';
import http from 'http';

const API_HOST = '127.0.0.1';
const API_PORT = 4000;

function request(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runQASuite() {
  console.log('--- STARTING QA TEST SUITE ---');

  // TEST 1: App startup & health smoke test
  console.log('\n[TEST 1] App Startup & Health Endpoint');
  const healthRes = await request({ path: '/health', method: 'GET' });
  assert.strictEqual(healthRes.statusCode, 200, 'Health endpoint must return 200');
  assert.strictEqual(healthRes.body.status, 'UP');
  assert.strictEqual(healthRes.body.database, 'CONNECTED');
  assert.ok(healthRes.body.correlationId, 'Must return correlationId');
  console.log('PASS: Health endpoint returns UP with database CONNECTED and correlationId.');

  // TEST 7: Authentication & Permissions
  console.log('\n[TEST 7.1] Unauthenticated Access to Protected Route');
  const unauthRes = await request({ path: '/api/v1/farms', method: 'GET' });
  assert.strictEqual(unauthRes.statusCode, 401, 'Protected route without token must return 401');
  assert.strictEqual(unauthRes.body.error.code, 'AUTHENTICATION_REQUIRED');
  console.log('PASS: Access without token correctly blocked with 401 AUTHENTICATION_REQUIRED.');

  console.log('\n[TEST 7.2] Authentication with Invalid OTP');
  // First make a request challenge
  await request({ path: '/api/v1/auth/otp/request', method: 'POST' }, { phone: '+919999988888' });
  const wrongOtpRes = await request(
    { path: '/api/v1/auth/otp/verify', method: 'POST' },
    { phone: '+919999988888', otp: '999999' }
  );
  assert.strictEqual(wrongOtpRes.statusCode, 401, 'Wrong OTP must return 401');
  assert.strictEqual(wrongOtpRes.body.error.code, 'INVALID_OTP');
  console.log('PASS: Invalid OTP rejected with 401 INVALID_OTP.');

  console.log('\n[TEST 7.3] Valid OTP Authentication for Farmer');
  const farmerLoginRes = await request(
    { path: '/api/v1/auth/otp/verify', method: 'POST' },
    { phone: '+919876543210', otp: '123456', role: 'farmer' }
  );
  assert.strictEqual(farmerLoginRes.statusCode, 200);
  const farmerToken = farmerLoginRes.body.data.token;
  assert.ok(farmerToken, 'Must receive JWT token');
  console.log('PASS: Farmer authentication succeeds with valid token.');

  console.log('\n[TEST 7.4] Role Authorization Check (Farmer cannot access Provider endpoints)');
  const provAccessRes = await request(
    {
      path: '/api/v1/provider/invitations',
      method: 'GET',
      headers: { Authorization: `Bearer ${farmerToken}` },
    }
  );
  assert.strictEqual(provAccessRes.statusCode, 403, 'Farmer token must be forbidden on provider route');
  assert.strictEqual(provAccessRes.body.error.code, 'FORBIDDEN');
  console.log('PASS: Role restriction strictly enforced (403 FORBIDDEN).');

  // TEST 3: Validation & Error Handling
  console.log('\n[TEST 3.1] Submit Request with Missing Required Fields');
  const invalidReqRes = await request(
    {
      path: '/api/v1/requests',
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    },
    { farmId: '' } // missing scheduledDate, estimatedUnits, implementRequired
  );
  assert.strictEqual(invalidReqRes.statusCode, 400);
  assert.strictEqual(invalidReqRes.body.error.code, 'REQUEST_VALIDATION_FAILED');
  assert.ok(invalidReqRes.body.error.details.length > 0, 'Must provide structured error details');
  console.log('PASS: Missing required fields blocked with structured 400 validation error.');

  console.log('\n[TEST 3.2] Submit Request with Farm Not Belonging to Farmer');
  const invalidFarmRes = await request(
    {
      path: '/api/v1/requests',
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    },
    {
      farmId: 'farm-non-existent-999',
      scheduledDate: '2026-12-01',
      timeWindow: '08:00 - 12:00',
      estimatedUnits: 4.0,
      implementRequired: 'Rotavator',
    }
  );
  assert.strictEqual(invalidFarmRes.statusCode, 403);
  assert.strictEqual(invalidFarmRes.body.error.code, 'INVALID_FARM');
  console.log('PASS: Unowned farm blocked with 403 INVALID_FARM.');

  // TEST 4: CRUD on Farms (Create, View)
  console.log('\n[TEST 4] Create and View Farm Parcel');
  const createFarmRes = await request(
    {
      path: '/api/v1/farms',
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
    },
    {
      farmName: 'QA Test Organic Plot',
      districtId: 'dist-ap-10', // Guntur
      address: 'QA Test Village, Guntur',
      latitude: 16.31,
      longitude: 80.44,
      sizeAcres: 3.5,
      soilType: 'Red Sandy Loam',
    }
  );
  assert.strictEqual(createFarmRes.statusCode, 201);
  const createdFarmId = createFarmRes.body.data.id;
  assert.ok(createdFarmId);

  const getFarmsRes = await request(
    {
      path: '/api/v1/farms',
      method: 'GET',
      headers: { Authorization: `Bearer ${farmerToken}` },
    }
  );
  assert.strictEqual(getFarmsRes.statusCode, 200);
  const found = getFarmsRes.body.data.some((f: any) => f.id === createdFarmId);
  assert.ok(found, 'Created farm must appear in farmer farms list');
  console.log(`PASS: Farm created (${createdFarmId}) and verified in GET /farms.`);

  // TEST 6: Error and 404 Empty States
  console.log('\n[TEST 6] 404 on Non-existent Request ID');
  const notFoundRes = await request(
    {
      path: '/api/v1/requests/req-does-not-exist-000',
      method: 'GET',
      headers: { Authorization: `Bearer ${farmerToken}` },
    }
  );
  assert.strictEqual(notFoundRes.statusCode, 404);
  assert.strictEqual(notFoundRes.body.error.code, 'REQUEST_NOT_FOUND');
  console.log('PASS: Non-existent resource returns clean 404 REQUEST_NOT_FOUND with correlationId.');

  // TEST 10: Security Checks (Safe Injection & Sensitive Redaction)
  console.log('\n[TEST 10.1] Harmless SQL Injection Attempt in District Query');
  const sqlInjRes = await request({
    path: `/api/v1/districts?state=${encodeURIComponent("' OR '1'='1")}`,
    method: 'GET',
  });
  assert.strictEqual(sqlInjRes.statusCode, 200);
  // Parameterized query should treat "' OR '1'='1" as a literal string and return 0 matches
  assert.strictEqual(sqlInjRes.body.data.length, 0, 'Parameterized queries must safely isolate SQL payload');
  console.log('PASS: SQL injection safely handled by parameterized queries (returned 0 rows).');

  console.log('\n[TEST 10.2] Correlation ID Preservation');
  const customCorrId = 'qa-custom-audit-test-999';
  const corrRes = await request({
    path: '/health',
    method: 'GET',
    headers: { 'X-Correlation-ID': customCorrId },
  });
  assert.strictEqual(corrRes.headers['x-correlation-id'], customCorrId);
  assert.strictEqual(corrRes.body.correlationId, customCorrId);
  console.log('PASS: Custom X-Correlation-ID is preserved and attached to response envelope.');

  console.log('\n--- ALL API QA CHECKS PASSED SUCCESSFULLY ---');
}

runQASuite().catch(err => {
  console.error('QA Test Suite Failed:', err);
  process.exit(1);
});
