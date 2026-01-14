import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer',
    required: [true, 'El ID del productor es obligatorio']
  },
  name: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  description: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'other'],
    required: [true, 'La categoría es obligatoria']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio debe ser mayor o igual a 0']
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP']
  },
  unit: {
    type: String,
    enum: ['kg', 'unit', 'liter', 'gram', 'dozen'],
    required: [true, 'La unidad es obligatoria']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  images: [{
    type: String // URLs de Cloudinary
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
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
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  }
}, {
  timestamps: true
});

// Índices para mejorar performance de búsquedas
productSchema.index({ 'name.es': 'text', 'name.en': 'text', 'name.fr': 'text', 'name.de': 'text' });
productSchema.index({ 'description.es': 'text', 'description.en': 'text', 'description.fr': 'text', 'description.de': 'text' });
productSchema.index({ producerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isAvailable: 1 });

// Método para verificar si hay stock disponible
productSchema.methods.hasStock = function(quantity = 1) {
  return this.isAvailable && this.stock >= quantity;
};

// Método para reducir stock
productSchema.methods.reduceStock = async function(quantity) {
  if (!this.hasStock(quantity)) {
    throw new Error('Stock insuficiente');
  }
  this.stock -= quantity;
  if (this.stock === 0) {
    this.isAvailable = false;
  }
  await this.save();
};

// Método para aumentar stock
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  if (this.stock > 0) {
    this.isAvailable = true;
  }
  await this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
