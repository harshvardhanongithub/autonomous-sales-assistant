import crypto from 'crypto';

// Polyfill global crypto for Node/Jest VM module runner
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';

describe('Sales Intelligence API Test Suite (Hermetic In-Memory)', () => {
  let mongoServer;
  let authToken;
  let testUserId;
  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'Test Engineer',
    email: `test_${uniqueSuffix}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_hermetic_jwt_secret_key_12345';

    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.14',
      },
    });

    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  describe('Health & Security Baseline', () => {
    it('GET / should return healthy server status (200)', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text || res.body).toBeTruthy();
    });

    it('GET /api/leads without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/leads');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Authentication Pipeline (Strict Assertions & Privilege Escalation Guard)', () => {
    it('POST /api/auth/register should fail on missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/required fields/i);
    });

    it('POST /api/auth/login should reject nonexistent credentials with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('POST /api/auth/register should create user and strictly force rep role against escalation (201)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, role: 'admin' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'rep');
      testUserId = res.body.user._id;
    });

    it('POST /api/auth/login should authenticate valid user (200)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });
  });

  describe('End-to-End Lead Intelligence & AI Pipeline Lifecycle', () => {
    let createdLeadId;

    it('POST /api/leads should score lead and persist aiSummary & aiSource (201)', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Enterprise Prospect',
          email: 'prospect@acmecorp.com',
          company: 'Acme Corp',
          notes: 'Urgent enterprise demo requested. Budget approved.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('aiSummary');
      expect(res.body).toHaveProperty('aiSource');
      expect(typeof res.body.score).toBe('number');
      expect(res.body.score).toBeGreaterThanOrEqual(50);
      createdLeadId = res.body._id;
    });

    it('GET /api/leads should retrieve authenticated user leads with AI metadata (200)', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('aiSummary');
      expect(res.body[0]).toHaveProperty('aiSource');
    });

    it('DELETE /api/leads/:id should delete lead (200)', async () => {
      const res = await request(app)
        .delete(`/api/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });
});