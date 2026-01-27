import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  content: {
    es: { type: String, required: true },
    en: { type: String },
    fr: { type: String },
    de: { type: String }
  },
  featuredImage: {
    type: String
  },
  category: {
    type: String,
    enum: ['recipes', 'tips', 'producers', 'sustainability', 'news', 'other'],
    default: 'other'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  readingTime: {
    type: Number,
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

// Generate slug from title before saving
articleSchema.pre('save', async function() {
  if (this.isModified('title') && !this.slug) {
    const titleEs = this.title.es || '';
    this.slug = titleEs
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate reading time based on content length
  if (this.isModified('content')) {
    const contentEs = this.content.es || '';
    const wordsPerMinute = 200;
    const wordCount = contentEs.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
