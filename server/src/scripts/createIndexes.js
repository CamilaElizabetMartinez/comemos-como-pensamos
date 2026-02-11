import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar modelos
import User from '../models/User.js';
import Product from '../models/Product.js';
import Producer from '../models/Producer.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import Article from '../models/Article.js';
import Contact from '../models/Contact.js';
import ProducerLead from '../models/ProducerLead.js';

const createIndexes = async () => {
  try {
    console.log('🔗 Conectando a MongoDB...');

    const MONGODB_URI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD || process.env.MONGODB_URI
      : process.env.MONGODB_URI;

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Creando índices...\n');

    // User indexes
    console.log('👤 User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('   ✓ email (unique)');
    console.log('   ✓ role');
    console.log('   ✓ createdAt');

    // Product indexes
    console.log('\n📦 Product indexes...');
    await Product.collection.createIndex({ producerId: 1 });
    await Product.collection.createIndex({ isAvailable: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    await Product.collection.createIndex({ 'name.es': 'text', 'description.es': 'text' });
    console.log('   ✓ producerId');
    console.log('   ✓ isAvailable');
    console.log('   ✓ category');
    console.log('   ✓ createdAt');
    console.log('   ✓ text search (name, description)');

    // Producer indexes
    console.log('\n🏭 Producer indexes...');
    await Producer.collection.createIndex({ userId: 1 }, { unique: true });
    await Producer.collection.createIndex({ isApproved: 1 });
    await Producer.collection.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
    await Producer.collection.createIndex({ referredBy: 1 });
    await Producer.collection.createIndex({ createdAt: -1 });
    console.log('   ✓ userId (unique)');
    console.log('   ✓ isApproved');
    console.log('   ✓ referralCode (unique, sparse)');
    console.log('   ✓ referredBy');
    console.log('   ✓ createdAt');

    // Order indexes
    console.log('\n🛒 Order indexes...');
    await Order.collection.createIndex({ customerId: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ paymentStatus: 1 });
    await Order.collection.createIndex({ 'items.producerId': 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ customerId: 1, createdAt: -1 });
    console.log('   ✓ customerId');
    console.log('   ✓ status');
    console.log('   ✓ paymentStatus');
    console.log('   ✓ items.producerId');
    console.log('   ✓ createdAt');
    console.log('   ✓ customerId + createdAt (compound)');

    // Coupon indexes
    console.log('\n🎟️  Coupon indexes...');
    await Coupon.collection.createIndex({ code: 1 }, { unique: true });
    await Coupon.collection.createIndex({ isActive: 1 });
    await Coupon.collection.createIndex({ validFrom: 1 });
    await Coupon.collection.createIndex({ validUntil: 1 });
    console.log('   ✓ code (unique)');
    console.log('   ✓ isActive');
    console.log('   ✓ validFrom');
    console.log('   ✓ validUntil');

    // Review indexes
    console.log('\n⭐ Review indexes...');
    await Review.collection.createIndex({ productId: 1 });
    await Review.collection.createIndex({ userId: 1 });
    await Review.collection.createIndex({ isApproved: 1 });
    await Review.collection.createIndex({ createdAt: -1 });
    console.log('   ✓ productId');
    console.log('   ✓ userId');
    console.log('   ✓ isApproved');
    console.log('   ✓ createdAt');

    // Article indexes
    console.log('\n📝 Article indexes...');
    await Article.collection.createIndex({ slug: 1 }, { unique: true });
    await Article.collection.createIndex({ status: 1 });
    await Article.collection.createIndex({ publishedAt: -1 });
    await Article.collection.createIndex({ category: 1 });
    console.log('   ✓ slug (unique)');
    console.log('   ✓ status');
    console.log('   ✓ publishedAt');
    console.log('   ✓ category');

    // Contact indexes
    console.log('\n📧 Contact indexes...');
    await Contact.collection.createIndex({ status: 1 });
    await Contact.collection.createIndex({ createdAt: -1 });
    console.log('   ✓ status');
    console.log('   ✓ createdAt');

    // ProducerLead indexes
    console.log('\n🌱 ProducerLead indexes...');
    await ProducerLead.collection.createIndex({ email: 1 });
    await ProducerLead.collection.createIndex({ status: 1 });
    await ProducerLead.collection.createIndex({ createdAt: -1 });
    console.log('   ✓ email');
    console.log('   ✓ status');
    console.log('   ✓ createdAt');

    console.log('\n✅ Todos los índices creados exitosamente!');
    console.log('\n📊 Estadísticas de índices:');

    // Mostrar estadísticas
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await mongoose.connection.db.collection(collection.name).indexes();
      console.log(`   ${collection.name}: ${indexes.length} índices`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando índices:', error);
    process.exit(1);
  }
};

// Ejecutar script
createIndexes();
