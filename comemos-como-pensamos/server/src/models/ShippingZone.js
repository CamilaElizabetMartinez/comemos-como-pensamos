import mongoose from 'mongoose';

const shippingZoneSchema = new mongoose.Schema({
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer',
    required: [true, 'El ID del productor es obligatorio']
  },
  name: {
    type: String,
    required: [true, 'El nombre de la zona es obligatorio'],
    trim: true
  },
  postalCodes: [{
    type: String,
    trim: true
  }],
  cities: [{
    type: String,
    trim: true
  }],
  cost: {
    type: Number,
    required: [true, 'El costo de envío es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  minimumOrder: {
    type: Number,
    min: [0, 'El pedido mínimo no puede ser negativo'],
    default: 0
  },
  estimatedDays: {
    type: Number,
    required: [true, 'Los días estimados son obligatorios'],
    min: [1, 'Los días estimados deben ser al menos 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
shippingZoneSchema.index({ producerId: 1 });
shippingZoneSchema.index({ postalCodes: 1 });
shippingZoneSchema.index({ cities: 1 });
shippingZoneSchema.index({ isActive: 1 });

// Método para verificar si un código postal está en esta zona
shippingZoneSchema.methods.coversPostalCode = function(postalCode) {
  return this.postalCodes.includes(postalCode.trim().toUpperCase());
};

// Método para verificar si una ciudad está en esta zona
shippingZoneSchema.methods.coversCity = function(city) {
  return this.cities.some(c => c.toLowerCase() === city.toLowerCase());
};

// Método para verificar si cumple con el pedido mínimo
shippingZoneSchema.methods.meetsMinimum = function(orderTotal) {
  return orderTotal >= this.minimumOrder;
};

const ShippingZone = mongoose.model('ShippingZone', shippingZoneSchema);

export default ShippingZone;
