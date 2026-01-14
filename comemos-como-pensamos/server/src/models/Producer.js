import mongoose from 'mongoose';

const producerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es obligatorio'],
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'El nombre del negocio es obligatorio'],
    trim: true
  },
  description: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  logo: {
    type: String // URL de Cloudinary
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    city: String,
    region: String
  },
  certifications: [{
    type: String,
    enum: ['organic', 'local', 'sustainable', 'fair-trade', 'vegan', 'gluten-free']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  shippingZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingZone'
  }]
}, {
  timestamps: true
});

// Índices para búsquedas
producerSchema.index({ businessName: 'text' });
producerSchema.index({ 'description.es': 'text', 'description.en': 'text', 'description.fr': 'text', 'description.de': 'text' });
producerSchema.index({ 'location.city': 1 });
producerSchema.index({ 'location.region': 1 });
producerSchema.index({ certifications: 1 });
producerSchema.index({ rating: -1 });
producerSchema.index({ isApproved: 1 });

// Virtual para obtener productos del productor
producerSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'producerId'
});

// Configurar toJSON para incluir virtuals
producerSchema.set('toJSON', { virtuals: true });
producerSchema.set('toObject', { virtuals: true });

const Producer = mongoose.model('Producer', producerSchema);

export default Producer;
