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
  },
  commissionRate: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
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
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  couponCode: {
    type: String
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
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
    enum: ['card', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeSessionId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bankTransferReference: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  trackingCarrier: {
    type: String,
    enum: ['correos', 'seur', 'mrw', 'dhl', 'ups', 'gls', 'fedex', 'other']
  },
  trackingUrl: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Índices (orderNumber ya tiene unique:true que crea índice automáticamente)
orderSchema.index({ customerId: 1 });
orderSchema.index({ 'items.producerId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware para generar número de orden
orderSchema.pre('save', async function() {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
});

// Método para obtener productores únicos de la orden
orderSchema.methods.getProducers = function() {
  const producerIds = [...new Set(this.items.map(item => item.producerId.toString()))];
  return producerIds;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
