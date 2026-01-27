import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const producerLeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  location: {
    city: String,
    market: String,
    address: String
  },
  categories: [{
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'eggs', 'honey', 'oil', 'wine', 'other']
  }],
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'negotiating', 'registered', 'lost'],
    default: 'new'
  },
  source: {
    type: String,
    enum: ['market', 'referral', 'event', 'social_media', 'website', 'association', 'other'],
    default: 'market'
  },
  notes: [noteSchema],
  nextFollowUp: {
    type: Date
  },
  lostReason: {
    type: String
  },
  convertedProducerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedVolume: {
    type: String
  },
  lastContactedAt: {
    type: Date
  }
}, {
  timestamps: true
});

producerLeadSchema.index({ status: 1 });
producerLeadSchema.index({ nextFollowUp: 1 });
producerLeadSchema.index({ source: 1 });
producerLeadSchema.index({ createdAt: -1 });
producerLeadSchema.index({ 'location.city': 1 });

const ProducerLead = mongoose.model('ProducerLead', producerLeadSchema);

export default ProducerLead;
