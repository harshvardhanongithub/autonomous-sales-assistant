import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';

dotenv.config();

// Connect to Database before running tests
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri && mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}, 15000);

// Close Database Connection after tests complete
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('1. Health Check Endpoint', () => {
  it('GET / should return 200 OK and health status message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('AI Sales Assistant API is running');
  });
});

describe('2. Authentication Routes Security & Validation', () => {
  it('POST /api/auth/login should reject invalid payloads with 400, 401, or 500', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent-user-test@domain.com',
        password: 'wrongpassword123'
      });

    expect([400, 401, 404, 500]).toContain(res.statusCode);
  }, 10000);

  it('POST /api/auth/register should fail when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect([400, 422, 500]).toContain(res.statusCode);
  }, 10000);
});

describe('3. Protected Lead Routes Security', () => {
  it('GET /api/leads should block unauthenticated access without JWT token', async () => {
    const res = await request(app).get('/api/leads');
    expect([401, 403]).toContain(res.statusCode);
  });
});