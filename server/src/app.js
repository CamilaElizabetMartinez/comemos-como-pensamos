import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
import connectDB from './config/database.js';

// Crear aplicación Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe webhook necesita el body raw (antes del parser JSON)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (más permisivo en desarrollo)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en desarrollo, 100 en producción
  message: { success: false, message: 'Demasiadas peticiones, intenta de nuevo más tarde' }
});

app.use('/api/', limiter);

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Comemos Como Pensamos',
    version: '1.0.0',
    status: 'active'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Importar rutas
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import producerRoutes from './routes/producers.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';
import reviewRoutes from './routes/reviews.js';
import shippingRoutes from './routes/shipping.js';
import emailRoutes from './routes/email.js';
import searchRoutes from './routes/search.js';
import favoritesRoutes from './routes/favorites.js';
import adminRoutes from './routes/admin.js';
import stripeRoutes from './routes/stripe.js';
import contactRoutes from './routes/contact.js';

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/contact', contactRoutes);

// Manejador de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});

export default app;
