import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Obtener favoritos del usuario
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'producerId',
        select: 'businessName logo'
      }
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: { favorites: user.favorites }
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

// @desc    Agregar producto a favoritos
// @route   POST /api/favorites/:productId
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const user = await User.findById(req.user._id);

    // Verificar si ya está en favoritos
    if (user.favorites.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'El producto ya está en favoritos'
      });
    }

    user.favorites.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Producto agregado a favoritos'
    });
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar a favoritos',
      error: error.message
    });
  }
};

// @desc    Remover producto de favoritos
// @route   DELETE /api/favorites/:productId
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(
      favId => favId.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Producto removido de favoritos'
    });
  } catch (error) {
    console.error('Error al remover de favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover de favoritos',
      error: error.message
    });
  }
};

// @desc    Verificar si producto está en favoritos
// @route   GET /api/favorites/check/:productId
// @access  Private
export const checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(productId);

    res.status(200).json({
      success: true,
      data: { isFavorite }
    });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar favorito',
      error: error.message
    });
  }
};
