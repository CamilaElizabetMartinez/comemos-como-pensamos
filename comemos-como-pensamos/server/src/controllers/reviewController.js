import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Crear reseña
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren productId, orderId y rating'
      });
    }

    // Verificar que la orden existe y pertenece al usuario
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No puedes dejar reseña para una orden que no es tuya'
      });
    }

    // Verificar que el producto está en la orden
    const productInOrder = order.items.find(
      item => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Este producto no está en la orden especificada'
      });
    }

    // Verificar que la orden ha sido entregada
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes dejar reseña después de que la orden sea entregada'
      });
    }

    // Verificar que no existe ya una reseña para este producto del mismo usuario
    const existingReview = await Review.findOne({
      userId: req.user._id,
      productId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este producto'
      });
    }

    // Crear reseña
    const review = await Review.create({
      userId: req.user._id,
      productId,
      producerId: productInOrder.producerId,
      orderId,
      rating,
      comment
    });

    // Poblar usuario
    await review.populate('userId', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: { review }
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);

    // Manejar error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este producto'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear reseña',
      error: error.message
    });
  }
};

// @desc    Obtener reseñas de un producto
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;

    const filters = { productId: req.params.productId };
    if (rating) filters.rating = parseInt(rating);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filters)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments(filters);

    // Obtener distribución de ratings
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: req.params.productId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: {
        reviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error al obtener reseñas del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas del producto',
      error: error.message
    });
  }
};

// @desc    Obtener reseñas de un productor
// @route   GET /api/reviews/producer/:producerId
// @access  Public
export const getProducerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ producerId: req.params.producerId })
      .populate('userId', 'firstName lastName')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ producerId: req.params.producerId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { reviews }
    });
  } catch (error) {
    console.error('Error al obtener reseñas del productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas del productor',
      error: error.message
    });
  }
};

// @desc    Eliminar reseña
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Verificar permisos
    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reseña'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reseña',
      error: error.message
    });
  }
};

// @desc    Actualizar reseña
// @route   PUT /api/reviews/:id
// @access  Private (Owner only)
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Verificar que el usuario es el dueño
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reseña'
      });
    }

    const { rating, comment } = req.body;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: { review }
    });
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reseña',
      error: error.message
    });
  }
};
