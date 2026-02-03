import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

let app;
beforeAll(async () => {
  const module = await import('./app.js');
  app = module.default;
});

describe('API server', () => {
  it('GET / returns API info', async () => {
    const res = await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/);
    expect(res.body).toHaveProperty('message', 'API de Comemos Como Pensamos');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('status', 'active');
  });

  it('GET /api/health returns OK', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/nonexistent returns 404', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .expect(404)
      .expect('Content-Type', /json/);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
