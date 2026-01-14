import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del cliente es obligatorio']
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripePaymentIntentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ 'items.producerId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware para generar número de orden
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Método para obtener productores únicos de la orden
orderSchema.methods.getProducers = function() {
  const producerIds = [...new Set(this.items.map(item => item.producerId.toString()))];
  return producerIds;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
