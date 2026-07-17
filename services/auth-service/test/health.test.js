const request = require('supertest');
const app = require('../server');

describe('Auth Service Health Check', () => {
  it('should return 200 OK and status healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'healthy');
  });
});