import Product from '../models/Product.js';
import Producer from '../models/Producer.js';

// @desc    Búsqueda avanzada de productos
// @route   GET /api/search/products
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      minRating,
      city,
      certification,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const filters = { isAvailable: true };

    // Búsqueda de texto
    if (query) {
      filters.$text = { $search: query };
    }

    if (category) filters.category = category;
    if (minRating) filters.rating = { $gte: parseFloat(minRating) };

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Pipeline de agregación para filtrar por ubicación o certificaciones del productor
    let pipeline = [
      { $match: filters }
    ];

    // Join con productor para filtros adicionales
    pipeline.push({
      $lookup: {
        from: 'producers',
        localField: 'producerId',
        foreignField: '_id',
        as: 'producer'
      }
    });

    pipeline.push({ $unwind: '$producer' });

    // Filtros del productor
    const producerFilters = {};
    if (city) producerFilters['producer.location.city'] = new RegExp(city, 'i');
    if (certification) producerFilters['producer.certifications'] = certification;

    if (Object.keys(producerFilters).length > 0) {
      pipeline.push({ $match: producerFilters });
    }

    // Ordenamiento
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    pipeline.push({ $sort: sortOption });

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const products = await Product.aggregate(pipeline);

    // Contar total
    const countPipeline = pipeline.slice(0, -2); // Remover skip y limit
    const totalResult = await Product.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { products }
    });
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};

// @desc    Autocomplete/sugerencias de búsqueda
// @route   GET /api/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Buscar productos que coincidan
    const products = await Product.find({
      $or: [
        { 'name.es': new RegExp(query, 'i') },
        { 'name.en': new RegExp(query, 'i') }
      ],
      isAvailable: true
    })
    .select('name images category')
    .limit(5);

    // Buscar productores que coincidan
    const producers = await Producer.find({
      businessName: new RegExp(query, 'i'),
      isApproved: true
    })
    .select('businessName logo')
    .limit(3);

    res.status(200).json({
      success: true,
      data: {
        products: products.map(p => ({
          id: p._id,
          name: p.name.es,
          image: p.images[0],
          type: 'product'
        })),
        producers: producers.map(p => ({
          id: p._id,
          name: p.businessName,
          image: p.logo,
          type: 'producer'
        }))
      }
    });
  } catch (error) {
    console.error('Error en sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias',
      error: error.message
    });
  }
};

// @desc    Buscar productores
// @route   GET /api/search/producers
// @access  Public
export const searchProducers = async (req, res) => {
  try {
    const { query, city, certification, page = 1, limit = 20 } = req.query;

    const filters = { isApproved: true };

    if (query) {
      filters.$text = { $search: query };
    }

    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (certification) filters.certifications = certification;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const producers = await Producer.find(filters)
      .sort({ rating: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Producer.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: producers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { producers }
    });
  } catch (error) {
    console.error('Error en búsqueda de productores:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};
