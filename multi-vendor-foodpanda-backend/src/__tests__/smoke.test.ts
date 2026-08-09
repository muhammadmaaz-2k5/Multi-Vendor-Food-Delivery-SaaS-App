import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

// ─── Smoke Tests: Core API Health ─────────────────────────────────────────────
// These tests verify that the most critical public and protected endpoints
// respond correctly under normal and abnormal conditions.
// ──────────────────────────────────────────────────────────────────────────────

describe('QB-805 Smoke Tests', () => {

  // ── Discovery API ────────────────────────────────────────────────────────────
  describe('Discovery - GET /api/v1/discovery/restaurants', () => {
    it('should return 200 and a list of restaurants', async () => {
      const res = await request(app).get('/api/v1/discovery/restaurants');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should accept a search query and return filtered results', async () => {
      const res = await request(app).get('/api/v1/discovery/restaurants?search=pizza');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Discovery - GET /api/v1/discovery/recommendations', () => {
    it('should return 200 with trending results for anonymous user', async () => {
      const res = await request(app).get('/api/v1/discovery/recommendations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.type).toBe('trending');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 200 with personalized or trending for a known phone', async () => {
      const res = await request(app).get('/api/v1/discovery/recommendations?phone=+10000000000');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // May be trending (no order history) or personalized
      expect(['trending', 'personalized']).toContain(res.body.type);
    });
  });

  // ── Auth API ─────────────────────────────────────────────────────────────────
  describe('Auth - POST /api/v1/auth/login', () => {
    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@quickbite.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'somepassword' });
      // Our zod validation returns 400 on bad input
      expect([400, 422]).toContain(res.status);
    });
  });

  // ── Protected Route Guards ────────────────────────────────────────────────────
  describe('Auth Guards', () => {
    it('GET /api/v1/restaurants/me should return 401 without a token', async () => {
      const res = await request(app).get('/api/v1/restaurants/me');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/restaurants/me should return 401 with a malformed token', async () => {
      const res = await request(app)
        .get('/api/v1/restaurants/me')
        .set('Authorization', 'Bearer thisisnotavalidtoken');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/admin/stats should return 200 (MVP: admin is unprotected for testing)', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(200);
    });
  });
});
