import mongoose from 'mongoose';

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['footer', 'popup', 'checkout', 'other'],
    default: 'footer'
  },
  language: {
    type: String,
    enum: ['es', 'en', 'fr', 'de'],
    default: 'es'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

newsletterSubscriptionSchema.index({ email: 1 });
newsletterSubscriptionSchema.index({ isActive: 1 });

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

export default NewsletterSubscription;
