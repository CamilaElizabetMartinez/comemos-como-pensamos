import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código del cupón es obligatorio'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'El valor del descuento es obligatorio'],
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  isFirstOrderOnly: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  maxUses: {
    type: Number,
    min: 0
  },
  usedCount: {
    type: Number,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  applicableCategories: [{
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'eggs', 'honey', 'oil', 'wine', 'other']
  }],
  applicableProducers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer'
  }]
}, {
  timestamps: true
});

couponSchema.index({ isActive: 1 });
couponSchema.index({ validUntil: 1 });

couponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  
  return true;
};

couponSchema.methods.canBeUsedByUser = function(userId) {
  if (!this.isValid()) return false;
  
  const userUses = this.usedBy.filter(
    use => use.userId.toString() === userId.toString()
  ).length;
  
  return userUses < this.maxUsesPerUser;
};

couponSchema.methods.calculateDiscount = function(orderSubtotal) {
  if (orderSubtotal < this.minOrderAmount) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = orderSubtotal * (this.discountValue / 100);
  } else {
    discount = this.discountValue;
  }
  
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }
  
  if (discount > orderSubtotal) {
    discount = orderSubtotal;
  }
  
  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
