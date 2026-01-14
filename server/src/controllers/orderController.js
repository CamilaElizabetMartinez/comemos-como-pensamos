import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Producer from '../models/Producer.js';

// @desc    Crear nueva orden
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingCost, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }

    // Validar y calcular subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      if (!product.hasStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name.es}`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        producerId: product.producerId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        productName: product.name.es
      });
    }

    const total = subtotal + (shippingCost || 0);

    // Crear orden
    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost: shippingCost || 0,
      total,
      shippingAddress,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Reducir stock de productos (se confirmará cuando el pago sea exitoso)
    // Por ahora lo dejamos pending hasta confirmar el pago

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order }
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden',
      error: error.message
    });
  }
};

// @desc    Obtener órdenes del usuario
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = { customerId: req.user._id };
    if (status) filters.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filters)
      .populate('items.productId', 'name images')
      .populate('items.producerId', 'businessName logo')
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

// @desc    Obtener orden por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email')
      .populate('items.productId', 'name images unit')
      .populate('items.producerId', 'businessName logo location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario puede ver esta orden
    const isCustomer = order.customerId._id.toString() === req.user._id.toString();
    const isProducer = order.items.some(async item => {
      const producer = await Producer.findOne({ userId: req.user._id });
      return producer && item.producerId.toString() === producer._id.toString();
    });
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProducer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: error.message
    });
  }
};

// @desc    Actualizar estado de orden
// @route   PUT /api/orders/:id/status
// @access  Private (Producer or Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar permisos (productor de algún item de la orden o admin)
    const producer = await Producer.findOne({ userId: req.user._id });
    const isProducer = producer && order.items.some(item =>
      item.producerId.toString() === producer._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isProducer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta orden'
      });
    }

    // Validar estado
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    // TODO: Enviar email de notificación al cliente

    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: { order }
    });
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de orden',
      error: error.message
    });
  }
};

// @desc    Obtener órdenes del productor
// @route   GET /api/orders/producer/orders
// @access  Private (Producer only)
export const getProducerOrders = async (req, res) => {
  try {
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer) {
      return res.status(403).json({
        success: false,
        message: 'No tienes un perfil de productor'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Buscar órdenes que contengan productos del productor
    const filters = { 'items.producerId': producer._id };
    if (status) filters.status = status;

    const orders = await Order.find(filters)
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.productId', 'name images')
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
    console.error('Error al obtener órdenes del productor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes del productor',
      error: error.message
    });
  }
};

// @desc    Confirmar pago de orden (webhook de Stripe llamará esto)
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private (System)
export const confirmOrderPayment = async (orderId, paymentIntentId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    order.paymentStatus = 'paid';
    order.stripePaymentIntentId = paymentIntentId;
    order.status = 'confirmed';

    await order.save();

    // Reducir stock de productos
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.reduceStock(item.quantity);
      }
    }

    // TODO: Enviar email de confirmación al cliente y productor

    return order;
  } catch (error) {
    console.error('Error al confirmar pago de orden:', error);
    throw error;
  }
};

export { confirmOrderPayment as confirmPayment };
