import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';
const mockUserInstance = {
  _id: MOCK_USER_ID,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
  preferredLanguage: 'es',
  isEmailVerified: true,
  comparePassword: vi.fn().mockResolvedValue(true),
  select: vi.fn().mockReturnThis()
};

const UserMock = {
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn()
};

vi.mock('../models/User.js', () => ({ default: UserMock }));
vi.mock('../utils/emailSender.js', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(undefined) }));

let app;
beforeAll(async () => {
  const module = await import('./auth.js');
  const express = (await import('express')).default;
  const authRoutes = module.default;
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/api/auth', authRoutes);
  app = testApp;
});

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when email and password are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email|contraseña|password/i);
      expect(UserMock.findOne).not.toHaveBeenCalled();
    });

    it('returns 401 when user does not exist', async () => {
      UserMock.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/credenciales|inválidas/i);
    });

    it('returns 401 when password is wrong', async () => {
      const userWithWrongPassword = {
        ...mockUserInstance,
        comparePassword: vi.fn().mockResolvedValue(false)
      };
      UserMock.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(userWithWrongPassword)
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 and token when credentials are valid', async () => {
      UserMock.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUserInstance)
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'validpassword' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      });
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token|autorizado/i);
      expect(UserMock.findById).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 and user when token is valid', async () => {
      const token = jwt.sign({ id: MOCK_USER_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
      UserMock.findById
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue(mockUserInstance)
        })
        .mockResolvedValueOnce(mockUserInstance);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      });
      expect(UserMock.findById).toHaveBeenCalledWith(MOCK_USER_ID);
    });
  });
});
