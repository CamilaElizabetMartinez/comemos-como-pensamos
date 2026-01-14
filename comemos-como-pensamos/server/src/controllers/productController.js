import Product from '../models/Product.js';
import Producer from '../models/Producer.js';
import { deleteImage } from '../config/cloudinary.js';

// @desc    Obtener todos los productos con filtros y paginación
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      producerId,
      isAvailable,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    // Construir filtros
    const filters = {};

    if (category) filters.category = category;
    if (producerId) filters.producerId = producerId;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Búsqueda de texto
    if (search) {
      filters.$text = { $search: search };
    }

    // Ordenamiento
    let sortOption = { createdAt: -1 }; // Por defecto, más recientes primero

    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name') sortOption = { 'name.es': 1 };

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filters)
      .populate('producerId', 'businessName logo location rating')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { products }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('producerId', 'businessName description logo location certifications rating totalReviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private (Producer only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, unit, stock, images, nutritionalInfo } = req.body;

    // Verificar que el usuario es productor y tiene perfil de productor
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer) {
      return res.status(403).json({
        success: false,
        message: 'Debes ser productor para crear productos'
      });
    }

    if (!producer.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta de productor debe estar aprobada para crear productos'
      });
    }

    // Crear producto
    const product = await Product.create({
      producerId: producer._id,
      name,
      description,
      category,
      price,
      unit,
      stock,
      images: images || [],
      nutritionalInfo
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private (Owner only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario es el dueño del producto
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer || product.producerId.toString() !== producer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este producto'
      });
    }

    // Actualizar campos
    const { name, description, category, price, unit, stock, images, isAvailable, nutritionalInfo } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (unit) product.unit = unit;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (nutritionalInfo) product.nutritionalInfo = nutritionalInfo;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario es el dueño del producto
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer || product.producerId.toString() !== producer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este producto'
      });
    }

    // Eliminar imágenes de Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extraer publicId de la URL
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1];
          const publicId = `comemos-como-pensamos/products/${filename.split('.')[0]}`;
          await deleteImage(publicId);
        } catch (err) {
          console.error('Error al eliminar imagen:', err);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// @desc    Obtener productos por productor
// @route   GET /api/products/producer/:producerId
// @access  Public
export const getProductsByProducer = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ producerId: req.params.producerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments({ producerId: req.params.producerId });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { products }
    });
  } catch (error) {
    console.error('Error al obtener productos del productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos del productor',
      error: error.message
    });
  }
};
