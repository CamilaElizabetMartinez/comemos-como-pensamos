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
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date
  },
  suspendReason: {
    type: String
  },
  commissionRate: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  specialCommissionRate: {
    type: Number,
    min: 0,
    max: 100
  },
  specialCommissionUntil: {
    type: Date
  },
  shippingZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingZone'
  }],
  whatsapp: {
    type: String,
    trim: true
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer'
  },
  referralBonusApplied: {
    type: Boolean,
    default: false
  },
  referralCount: {
    type: Number,
    default: 0
  }
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
producerSchema.index({ referredBy: 1 });

// Virtual to get producer's products
producerSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'producerId'
});

// Virtual to get referred producers
producerSchema.virtual('referrals', {
  ref: 'Producer',
  localField: '_id',
  foreignField: 'referredBy'
});

// Generate referral code before saving
producerSchema.pre('save', async function() {
  if (!this.referralCode) {
    const businessPrefix = this.businessName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${businessPrefix}${randomPart}`;
  }
});

// Method to get current active commission rate
producerSchema.methods.getCurrentCommissionRate = function() {
  if (this.specialCommissionRate !== undefined && 
      this.specialCommissionUntil && 
      new Date() < this.specialCommissionUntil) {
    return this.specialCommissionRate;
  }
  return this.commissionRate;
};

// Configurar toJSON para incluir virtuals
producerSchema.set('toJSON', { virtuals: true });
producerSchema.set('toObject', { virtuals: true });

const Producer = mongoose.model('Producer', producerSchema);

export default Producer;
