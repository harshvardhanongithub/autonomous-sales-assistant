import request from 'supertest';
import app from '../app.js';

describe('GET /', () => {
  it('should return 200 OK and health status message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('AI Sales Assistant API is running');
  });
});
