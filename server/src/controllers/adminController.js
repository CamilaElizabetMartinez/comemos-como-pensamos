import User from '../models/User.js';
import Producer from '../models/Producer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { notifyProducerApproval } from '../services/notificationService.js';

// @desc    Obtener estadísticas generales del dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Contadores generales
    const totalUsers = await User.countDocuments();
    const totalProducers = await Producer.countDocuments({ isApproved: true });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Ingresos totales
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // Estadísticas de este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Productores pendientes de aprobación
    const pendingProducers = await Producer.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue.toFixed(2),
          newUsersThisMonth,
          ordersThisMonth,
          pendingProducers
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (role) filters.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { users }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// @desc    Obtener productores pendientes de aprobación
// @route   GET /api/admin/producers/pending
// @access  Private (Admin only)
export const getPendingProducers = async (req, res) => {
  try {
    const producers = await Producer.find({ isApproved: false })
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: producers.length,
      data: { producers }
    });
  } catch (error) {
    console.error('Error al obtener productores pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productores pendientes',
      error: error.message
    });
  }
};

// @desc    Update producer commission rate
// @route   PUT /api/admin/producers/:id/commission
// @access  Private (Admin only)
export const updateProducerCommission = async (req, res) => {
  try {
    const { commissionRate, specialCommissionRate, specialCommissionUntil } = req.body;
    
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    if (commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 100) {
        return res.status(400).json({
          success: false,
          message: 'La comisión debe estar entre 0 y 100'
        });
      }
      producer.commissionRate = commissionRate;
    }

    if (specialCommissionRate !== undefined) {
      if (specialCommissionRate < 0 || specialCommissionRate > 100) {
        return res.status(400).json({
          success: false,
          message: 'La comisión especial debe estar entre 0 y 100'
        });
      }
      producer.specialCommissionRate = specialCommissionRate;
    }

    if (specialCommissionUntil !== undefined) {
      producer.specialCommissionUntil = specialCommissionUntil ? new Date(specialCommissionUntil) : null;
    }

    if (specialCommissionRate === null || specialCommissionRate === '') {
      producer.specialCommissionRate = undefined;
      producer.specialCommissionUntil = undefined;
    }

    await producer.save();

    res.status(200).json({
      success: true,
      message: 'Comisión actualizada correctamente',
      data: { 
        producer,
        currentCommissionRate: producer.getCurrentCommissionRate()
      }
    });
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar comisión',
      error: error.message
    });
  }
};

// @desc    Approve producer
// @route   PUT /api/admin/producers/:id/approve
// @access  Private (Admin only)
export const approveProducer = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id).populate('userId');

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    producer.isApproved = true;
    producer.isVerified = true;

    const REFERRAL_BONUS_COMMISSION = 10;
    const REFERRAL_BONUS_DURATION_MONTHS = 3;

    if (producer.referredBy && !producer.referralBonusApplied) {
      const bonusEndDate = new Date();
      bonusEndDate.setMonth(bonusEndDate.getMonth() + REFERRAL_BONUS_DURATION_MONTHS);

      producer.referralBonusApplied = true;
      producer.specialCommissionRate = REFERRAL_BONUS_COMMISSION;
      producer.specialCommissionUntil = bonusEndDate;

      const referrer = await Producer.findById(producer.referredBy);
      if (referrer) {
        referrer.referralCount += 1;
        
        if (!referrer.specialCommissionRate || 
            !referrer.specialCommissionUntil || 
            referrer.specialCommissionUntil < new Date()) {
          referrer.specialCommissionRate = REFERRAL_BONUS_COMMISSION;
          referrer.specialCommissionUntil = bonusEndDate;
        } else {
          referrer.specialCommissionUntil = new Date(
            Math.max(referrer.specialCommissionUntil.getTime(), bonusEndDate.getTime())
          );
        }
        await referrer.save();
      }
    }

    await producer.save();

    try {
      await notifyProducerApproval(producer, true);
    } catch (pushError) {
      console.error('Error al enviar notificación push de aprobación:', pushError);
    }

    res.status(200).json({
      success: true,
      message: 'Productor aprobado exitosamente',
      data: { producer }
    });
  } catch (error) {
    console.error('Error al aprobar productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar productor',
      error: error.message
    });
  }
};

// @desc    Suspend/unsuspend producer
// @route   PUT /api/admin/producers/:id/suspend
// @access  Private (Admin only)
export const suspendProducer = async (req, res) => {
  try {
    const { reason } = req.body;
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    if (producer.isSuspended) {
      producer.isSuspended = false;
      producer.suspendedAt = null;
      producer.suspendReason = null;
    } else {
      producer.isSuspended = true;
      producer.suspendedAt = new Date();
      producer.suspendReason = reason || '';
    }

    await producer.save();

    res.status(200).json({
      success: true,
      message: producer.isSuspended ? 'Productor suspendido' : 'Productor reactivado',
      data: { producer }
    });
  } catch (error) {
    console.error('Error al suspender productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al suspender productor',
      error: error.message
    });
  }
};

// @desc    Delete producer permanently
// @route   DELETE /api/admin/producers/:id
// @access  Private (Admin only)
export const deleteProducer = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    // Delete associated products
    await Product.deleteMany({ producerId: producer._id });

    // Delete the producer
    await Producer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Productor y sus productos eliminados permanentemente'
    });
  } catch (error) {
    console.error('Error al eliminar productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar productor',
      error: error.message
    });
  }
};

// @desc    Rechazar productor
// @route   PUT /api/admin/producers/:id/reject
// @access  Private (Admin only)
export const rejectProducer = async (req, res) => {
  try {
    const { reason } = req.body;
    const producer = await Producer.findById(req.params.id).populate('userId');

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }

    // Notificación push al productor antes de eliminar
    try {
      await notifyProducerApproval(producer, false);
    } catch (pushError) {
      console.error('Error al enviar notificación push de rechazo:', pushError);
    }

    await Producer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Productor rechazado'
    });
  } catch (error) {
    console.error('Error al rechazar productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar productor',
      error: error.message
    });
  }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private (Admin only)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, featured } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filters = {};
    if (search) {
      filters.name = { $regex: search, $options: 'i' };
    }
    if (featured === 'true') {
      filters.isFeatured = true;
    } else if (featured === 'false') {
      filters.isFeatured = false;
    }

    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('producerId', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filters)
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// @desc    Toggle product featured status
// @route   PUT /api/admin/products/:id/featured
// @access  Private (Admin only)
export const toggleProductFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      data: { isFeatured: product.isFeatured },
      message: product.isFeatured ? 'Producto destacado' : 'Producto quitado de destacados'
    });
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// @desc    Moderar producto (ocultar/eliminar)
// @route   PUT /api/admin/products/:id/moderate
// @access  Private (Admin only)
export const moderateProduct = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'hide' | 'delete'

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (action === 'hide') {
      product.isAvailable = false;
      await product.save();
    } else if (action === 'delete') {
      await Product.findByIdAndDelete(req.params.id);
    }

    // TODO: Enviar notificación al productor

    res.status(200).json({
      success: true,
      message: `Producto ${action === 'hide' ? 'ocultado' : 'eliminado'} exitosamente`
    });
  } catch (error) {
    console.error('Error al moderar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al moderar producto',
      error: error.message
    });
  }
};

// @desc    Obtener todas las órdenes
// @route   GET /api/admin/orders
// @access  Private (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filters)
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { orders }
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: error.message
    });
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar otros admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar a otro administrador'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// @desc    Reportes de ventas
// @route   GET /api/admin/reports/sales
// @access  Private (Admin only)
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filters = { paymentStatus: 'paid' };
    if (Object.keys(dateFilter).length > 0) {
      filters.createdAt = dateFilter;
    }

    const orders = await Order.find(filters);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Productos más vendidos
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productName: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.priceAtPurchase * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        report: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders,
          averageOrderValue: averageOrderValue.toFixed(2),
          topProducts
        }
      }
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: error.message
    });
  }
};
