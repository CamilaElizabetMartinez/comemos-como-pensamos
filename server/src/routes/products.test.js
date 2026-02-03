import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const ProductMock = {
  find: vi.fn(),
  countDocuments: vi.fn(),
  findById: vi.fn()
};

const ProducerMock = {
  find: vi.fn()
};

vi.mock('../models/Product.js', () => ({ default: ProductMock }));
vi.mock('../models/Producer.js', () => ({ default: ProducerMock }));

let app;
beforeAll(async () => {
  const { default: express } = await import('express');
  const productRoutes = (await import('./products.js')).default;
  const testApp = express();
  testApp.use(express.json());
  testApp.use('/api/products', productRoutes);
  app = testApp;
});

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ProducerMock.find.mockResolvedValue([{ _id: 'producerId1' }]);
    ProductMock.find.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      skip: vi.fn().mockResolvedValue([])
    });
    ProductMock.countDocuments.mockResolvedValue(0);
  });

  describe('GET /api/products', () => {
    it('returns 200 with products array and pagination', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('products');
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('currentPage');
    });

    it('accepts query params for pagination and filters', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ page: 2, limit: 10, category: 'vegetables' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.currentPage).toBe(2);
      expect(ProductMock.find).toHaveBeenCalled();
    });
  });
});
