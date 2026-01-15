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

// @desc    Aprobar productor
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
    await producer.save();

    // Notificación push al productor
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
