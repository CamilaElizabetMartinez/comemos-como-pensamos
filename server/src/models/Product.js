import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  sku: { type: String },
  price: {
    type: Number,
    required: [true, 'El precio de la variante es obligatorio'],
    min: [0, 'El precio debe ser mayor o igual a 0']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'El precio de comparación debe ser mayor o igual a 0']
  },
  stock: {
    type: Number,
    required: [true, 'El stock de la variante es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  weight: {
    type: Number,
    min: [0, 'El peso debe ser mayor o igual a 0']
  },
  weightUnit: {
    type: String,
    enum: ['g', 'kg', 'ml', 'l'],
    default: 'g'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: true });

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
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'eggs', 'honey', 'oil', 'wine', 'other'],
    required: [true, 'La categoría es obligatoria']
  },
  // Base price (used when no variants or as reference)
  price: {
    type: Number,
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
    default: 'unit'
  },
  // Base stock (used when no variants)
  stock: {
    type: Number,
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  // Variants array
  variants: [variantSchema],
  // If true, product uses variants; if false, uses base price/stock
  hasVariants: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
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

// Get default variant or first available
productSchema.methods.getDefaultVariant = function() {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return null;
  }
  const defaultVariant = this.variants.find(variant => variant.isDefault && variant.isAvailable);
  if (defaultVariant) return defaultVariant;
  return this.variants.find(variant => variant.isAvailable) || this.variants[0];
};

// Get price range for display (min - max)
productSchema.methods.getPriceRange = function() {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return { min: this.price, max: this.price };
  }
  const availableVariants = this.variants.filter(variant => variant.isAvailable);
  if (availableVariants.length === 0) {
    const prices = this.variants.map(variant => variant.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }
  const prices = availableVariants.map(variant => variant.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

// Get display price (default variant price or base price)
productSchema.methods.getDisplayPrice = function() {
  if (this.hasVariants && this.variants && this.variants.length > 0) {
    const defaultVariant = this.getDefaultVariant();
    return defaultVariant ? defaultVariant.price : this.variants[0].price;
  }
  return this.price;
};

// Get total stock across all variants
productSchema.methods.getTotalStock = function() {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return this.stock;
  }
  return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
};

// Check stock for specific variant or base product
productSchema.methods.hasStock = function(quantity = 1, variantId = null) {
  if (!this.isAvailable) return false;
  
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    return variant && variant.isAvailable && variant.stock >= quantity;
  }
  
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.some(variant => variant.isAvailable && variant.stock >= quantity);
  }
  
  return this.stock >= quantity;
};

// Reduce stock for specific variant or base product
productSchema.methods.reduceStock = async function(quantity, variantId = null) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (!variant || variant.stock < quantity) {
      throw new Error('Stock insuficiente para esta variante');
    }
    variant.stock -= quantity;
    if (variant.stock === 0) {
      variant.isAvailable = false;
    }
  } else {
    if (this.stock < quantity) {
      throw new Error('Stock insuficiente');
    }
    this.stock -= quantity;
    if (this.stock === 0 && !this.hasVariants) {
      this.isAvailable = false;
    }
  }
  
  // Update product availability based on total stock
  if (this.hasVariants) {
    const hasAnyStock = this.variants.some(variant => variant.stock > 0);
    this.isAvailable = hasAnyStock;
  }
  
  await this.save();
};

// Increase stock for specific variant or base product
productSchema.methods.increaseStock = async function(quantity, variantId = null) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (variant) {
      variant.stock += quantity;
      if (variant.stock > 0) {
        variant.isAvailable = true;
      }
    }
  } else {
    this.stock += quantity;
  }
  
  if (this.getTotalStock() > 0) {
    this.isAvailable = true;
  }
  
  await this.save();
};

// Get variant by ID
productSchema.methods.getVariant = function(variantId) {
  if (!this.hasVariants || !this.variants) return null;
  return this.variants.id(variantId);
};

const Product = mongoose.model('Product', productSchema);

export default Product;
