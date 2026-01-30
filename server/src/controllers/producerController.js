import Producer from '../models/Producer.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { notifyAdminNewProducer } from '../services/notificationService.js';

// @desc    Obtener todos los productores
// @route   GET /api/producers
// @access  Public
export const getProducers = async (req, res) => {
  try {
    const {
      city,
      region,
      certification,
      minRating,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Only approved and non-suspended producers for public
    const filters = { 
      isApproved: true,
      isSuspended: { $ne: true }
    };

    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (region) filters['location.region'] = new RegExp(region, 'i');
    if (certification) filters.certifications = certification;
    if (minRating) filters.rating = { $gte: parseFloat(minRating) };

    if (search) {
      filters.$text = { $search: search };
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const producers = await Producer.find(filters)
      .populate('userId', 'email firstName lastName')
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
    console.error('Error al obtener productores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productores',
      error: error.message
    });
  }
};

// @desc    Obtener productor por ID
// @route   GET /api/producers/:id
// @access  Public
export const getProducerById = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone');

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    // Check if producer is suspended or not approved
    if (producer.isSuspended || !producer.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Productor no disponible'
      });
    }

    // Obtener productos del productor
    const products = await Product.find({ producerId: producer._id, isAvailable: true })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        producer,
        products
      }
    });
  } catch (error) {
    console.error('Error al obtener productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productor',
      error: error.message
    });
  }
};

// @desc    Crear perfil de productor
// @route   POST /api/producers
// @access  Private (User must be producer role)
export const createProducer = async (req, res) => {
  try {
    const {
      businessName,
      description,
      logo,
      location,
      certifications,
      referralCode
    } = req.body;

    if (req.user.role !== 'producer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Debes tener rol de productor para crear un perfil de productor'
      });
    }

    const existingProducer = await Producer.findOne({ userId: req.user._id });

    if (existingProducer) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un perfil de productor para este usuario'
      });
    }

    const producerData = {
      userId: req.user._id,
      businessName,
      description,
      logo,
      location,
      certifications: certifications || [],
      isApproved: false
    };

    if (referralCode) {
      const referrer = await Producer.findOne({ 
        referralCode: referralCode.toUpperCase(),
        isApproved: true
      });
      
      if (referrer) {
        producerData.referredBy = referrer._id;
      }
    }

    const producer = await Producer.create(producerData);

    try {
      await notifyAdminNewProducer(producer);
    } catch (pushError) {
      console.error('Error al enviar notificación push a admins:', pushError);
    }

    res.status(201).json({
      success: true,
      message: 'Perfil de productor creado exitosamente. Pendiente de aprobación por administrador.',
      data: { producer }
    });
  } catch (error) {
    console.error('Error al crear productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear perfil de productor',
      error: error.message
    });
  }
};

// @desc    Actualizar perfil de productor
// @route   PUT /api/producers/:id
// @access  Private (Owner only)
export const updateProducer = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    // Verificar que el usuario es el dueño del perfil
    if (producer.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este perfil'
      });
    }

    // Actualizar campos permitidos
    const {
      businessName,
      description,
      logo,
      location,
      certifications
    } = req.body;

    if (businessName) producer.businessName = businessName;
    if (description) producer.description = description;
    if (logo) producer.logo = logo;
    if (location) producer.location = location;
    if (certifications) producer.certifications = certifications;

    await producer.save();

    res.status(200).json({
      success: true,
      message: 'Perfil de productor actualizado exitosamente',
      data: { producer }
    });
  } catch (error) {
    console.error('Error al actualizar productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil de productor',
      error: error.message
    });
  }
};

// @desc    Get producer statistics
// @route   GET /api/producers/:id/stats
// @access  Private (Owner or Admin)
export const getProducerStats = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    if (producer.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas estadísticas'
      });
    }

    const totalProducts = await Product.countDocuments({ producerId: producer._id });
    const activeProducts = await Product.countDocuments({ producerId: producer._id, isAvailable: true });

    const orders = await Order.find({ 'items.producerId': producer._id });
    const totalOrders = orders.length;

    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order =>
      ['pending', 'confirmed', 'preparing', 'shipped'].includes(order.status)
    ).length;

    let grossRevenue = 0;
    let totalCommission = 0;

    orders.forEach(order => {
      if (order.paymentStatus === 'paid') {
        order.items.forEach(item => {
          if (item.producerId.toString() === producer._id.toString()) {
            const itemTotal = item.priceAtPurchase * item.quantity;
            const itemCommissionRate = item.commissionRate !== undefined ? item.commissionRate : 15;
            const itemCommission = itemTotal * (itemCommissionRate / 100);
            
            grossRevenue += itemTotal;
            totalCommission += itemCommission;
          }
        });
      }
    });

    const netRevenue = grossRevenue - totalCommission;
    const currentCommissionRate = producer.getCurrentCommissionRate();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders,
          completedOrders,
          pendingOrders,
          grossRevenue: grossRevenue.toFixed(2),
          totalCommission: totalCommission.toFixed(2),
          netRevenue: netRevenue.toFixed(2),
          totalRevenue: netRevenue.toFixed(2),
          currentCommissionRate,
          commissionRate: producer.commissionRate,
          specialCommissionRate: producer.specialCommissionRate,
          specialCommissionUntil: producer.specialCommissionUntil,
          rating: producer.rating,
          totalReviews: producer.totalReviews
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener perfil de productor del usuario actual
// @route   GET /api/producers/my-profile
// @access  Private (Producer only)
export const getMyProducerProfile = async (req, res) => {
  try {
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un perfil de productor'
      });
    }

    res.status(200).json({
      success: true,
      data: { producer }
    });
  } catch (error) {
    console.error('Error al obtener perfil de productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de productor',
      error: error.message
    });
  }
};
