import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es obligatorio']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es obligatorio']
  },
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producer',
    required: [true, 'El ID del productor es obligatorio']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'El ID de la orden es obligatorio']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es obligatoria'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  }
}, {
  timestamps: true
});

// Índices
reviewSchema.index({ productId: 1 });
reviewSchema.index({ producerId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ rating: 1 });

// Evitar reviews duplicadas por usuario en el mismo producto
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Middleware para actualizar rating del producto después de crear review
reviewSchema.post('save', async function() {
  try {
    const Product = mongoose.model('Product');
    const Producer = mongoose.model('Producer');

    // Actualizar rating del producto
    const productReviews = await mongoose.model('Review').find({ productId: this.productId });
    const productAvgRating = productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length;

    await Product.findByIdAndUpdate(this.productId, {
      rating: Math.round(productAvgRating * 10) / 10,
      totalReviews: productReviews.length
    });

    // Actualizar rating del productor
    const producerReviews = await mongoose.model('Review').find({ producerId: this.producerId });
    const producerAvgRating = producerReviews.reduce((acc, review) => acc + review.rating, 0) / producerReviews.length;

    await Producer.findByIdAndUpdate(this.producerId, {
      rating: Math.round(producerAvgRating * 10) / 10,
      totalReviews: producerReviews.length
    });
  } catch (error) {
    console.error('Error al actualizar ratings:', error);
  }
});

// Middleware para actualizar ratings al eliminar review
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Product = mongoose.model('Product');
      const Producer = mongoose.model('Producer');

      // Actualizar rating del producto
      const productReviews = await mongoose.model('Review').find({ productId: doc.productId });
      const productAvgRating = productReviews.length > 0
        ? productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length
        : 0;

      await Product.findByIdAndUpdate(doc.productId, {
        rating: Math.round(productAvgRating * 10) / 10,
        totalReviews: productReviews.length
      });

      // Actualizar rating del productor
      const producerReviews = await mongoose.model('Review').find({ producerId: doc.producerId });
      const producerAvgRating = producerReviews.length > 0
        ? producerReviews.reduce((acc, review) => acc + review.rating, 0) / producerReviews.length
        : 0;

      await Producer.findByIdAndUpdate(doc.producerId, {
        rating: Math.round(producerAvgRating * 10) / 10,
        totalReviews: producerReviews.length
      });
    } catch (error) {
      console.error('Error al actualizar ratings:', error);
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
