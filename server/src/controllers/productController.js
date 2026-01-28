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
    const { 
      name, 
      description, 
      category, 
      price, 
      unit, 
      stock, 
      images, 
      nutritionalInfo,
      hasVariants,
      variants 
    } = req.body;

    // Verify user is a producer
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

    // Validate variants if hasVariants is true
    if (hasVariants && (!variants || variants.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Debes añadir al menos una variante'
      });
    }

    // Process variants - ensure one is default
    let processedVariants = [];
    if (hasVariants && variants && variants.length > 0) {
      processedVariants = variants.map((variant, index) => ({
        ...variant,
        isDefault: variant.isDefault || index === 0,
        isAvailable: variant.stock > 0
      }));
      
      // Ensure only one default
      const defaultCount = processedVariants.filter(v => v.isDefault).length;
      if (defaultCount > 1) {
        processedVariants = processedVariants.map((variant, index) => ({
          ...variant,
          isDefault: index === 0
        }));
      }
    }

    // Create product
    const productData = {
      producerId: producer._id,
      name,
      description,
      category,
      unit,
      images: images || [],
      nutritionalInfo,
      hasVariants: hasVariants || false
    };

    if (hasVariants) {
      productData.variants = processedVariants;
      // Set base price from default variant for sorting/filtering
      const defaultVariant = processedVariants.find(v => v.isDefault) || processedVariants[0];
      productData.price = defaultVariant.price;
      productData.stock = processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    } else {
      productData.price = price;
      productData.stock = stock;
    }

    const product = await Product.create(productData);

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

    // Verify owner
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer || product.producerId.toString() !== producer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este producto'
      });
    }

    const { 
      name, 
      description, 
      category, 
      price, 
      unit, 
      stock, 
      images, 
      isAvailable, 
      nutritionalInfo,
      hasVariants,
      variants 
    } = req.body;

    // Update basic fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (images) product.images = images;
    if (nutritionalInfo) product.nutritionalInfo = nutritionalInfo;

    // Handle variants update
    if (hasVariants !== undefined) {
      product.hasVariants = hasVariants;
    }

    if (product.hasVariants) {
      if (variants && variants.length > 0) {
        // Process variants
        const processedVariants = variants.map((variant, index) => ({
          _id: variant._id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stock: variant.stock,
          weight: variant.weight,
          weightUnit: variant.weightUnit,
          isDefault: variant.isDefault || index === 0,
          isAvailable: variant.stock > 0
        }));

        // Ensure only one default
        const defaults = processedVariants.filter(v => v.isDefault);
        if (defaults.length > 1) {
          processedVariants.forEach((variant, index) => {
            variant.isDefault = index === 0;
          });
        } else if (defaults.length === 0) {
          processedVariants[0].isDefault = true;
        }

        product.variants = processedVariants;
        
        // Update base price/stock for filtering
        const defaultVariant = processedVariants.find(v => v.isDefault) || processedVariants[0];
        product.price = defaultVariant.price;
        product.stock = processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        product.isAvailable = processedVariants.some(v => v.stock > 0);
      }
    } else {
      // No variants - use base price/stock
      product.variants = [];
      if (price !== undefined) product.price = price;
      if (stock !== undefined) product.stock = stock;
      if (isAvailable !== undefined) product.isAvailable = isAvailable;
    }

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

// @desc    Verificar disponibilidad de stock para múltiples productos
// @route   POST /api/products/check-stock
// @access  Public
export const checkStock = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una lista de productos'
      });
    }

    const stockIssues = [];
    const validItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        stockIssues.push({
          productId: item.productId,
          variantId: item.variantId,
          issue: 'not_found',
          message: 'Producto no encontrado'
        });
        continue;
      }

      if (!product.isAvailable) {
        stockIssues.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: product.name.es,
          issue: 'unavailable',
          message: 'Producto no disponible',
          requestedQuantity: item.quantity,
          availableStock: 0
        });
        continue;
      }

      // Check stock based on variants
      let currentStock = product.stock;
      let itemPrice = product.price;
      let variantName = null;

      if (product.hasVariants && item.variantId) {
        const variant = product.getVariant(item.variantId);
        
        if (!variant) {
          stockIssues.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: product.name.es,
            issue: 'variant_not_found',
            message: 'Variante no encontrada'
          });
          continue;
        }

        if (!variant.isAvailable) {
          stockIssues.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: product.name.es,
            variantName: variant.name?.es,
            issue: 'variant_unavailable',
            message: 'Variante no disponible',
            requestedQuantity: item.quantity,
            availableStock: 0
          });
          continue;
        }

        currentStock = variant.stock;
        itemPrice = variant.price;
        variantName = variant.name?.es;
      }

      if (currentStock < item.quantity) {
        stockIssues.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: product.name.es,
          variantName,
          issue: 'insufficient_stock',
          message: `Stock insuficiente. Disponible: ${currentStock}`,
          requestedQuantity: item.quantity,
          availableStock: currentStock
        });
        continue;
      }

      validItems.push({
        productId: product._id,
        variantId: item.variantId,
        productName: product.name.es,
        variantName,
        requestedQuantity: item.quantity,
        availableStock: currentStock,
        price: itemPrice
      });
    }

    res.status(200).json({
      success: stockIssues.length === 0,
      allAvailable: stockIssues.length === 0,
      data: {
        validItems,
        stockIssues
      }
    });
  } catch (error) {
    console.error('Error al verificar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar stock',
      error: error.message
    });
  }
};
