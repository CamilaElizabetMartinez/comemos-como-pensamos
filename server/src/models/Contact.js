import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'El asunto es obligatorio'],
    enum: ['general', 'order', 'product', 'producer', 'technical', 'other']
  },
  message: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied', 'archived'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  repliedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;











