import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Producer from '../models/Producer.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail, sendNewOrderToProducerEmail } from '../utils/emailSender.js';

// @desc    Crear nueva orden
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingCost, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }

    if (!paymentMethod || !['card', 'bank_transfer', 'cash_on_delivery'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
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

    // Determinar estado inicial según método de pago
    let initialStatus = 'pending';
    let initialPaymentStatus = 'pending';

    // Para contra entrega, la orden se confirma directamente
    if (paymentMethod === 'cash_on_delivery') {
      initialStatus = 'confirmed';
    }

    // Crear orden
    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost: shippingCost || 0,
      total,
      shippingAddress,
      notes,
      paymentMethod,
      status: initialStatus,
      paymentStatus: initialPaymentStatus
    });

    // Para contra entrega, reducir stock inmediatamente
    if (paymentMethod === 'cash_on_delivery') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          await product.reduceStock(item.quantity);
        }
      }
    }

    // Datos adicionales según método de pago
    let responseData = { order };

    if (paymentMethod === 'bank_transfer') {
      responseData.bankDetails = {
        bankName: process.env.BANK_NAME || 'Banco Ejemplo',
        accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'Comemos Como Pensamos S.L.',
        iban: process.env.BANK_IBAN || 'ES00 0000 0000 0000 0000 0000',
        bic: process.env.BANK_BIC || 'XXXXESXX',
        reference: order.orderNumber
      };
    }

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        await sendOrderConfirmationEmail(order, user);
      }

      const producerIds = [...new Set(order.items.map(item => item.producerId.toString()))];
      for (const producerId of producerIds) {
        const producer = await Producer.findById(producerId);
        if (producer) {
          const producerUser = await User.findById(producer.userId);
          if (producerUser) {
            await sendNewOrderToProducerEmail(order, producer, producerUser);
          }
        }
      }
    } catch (emailError) {
      console.error('Error al enviar emails de orden:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: responseData
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
    const { status, trackingNumber, trackingCarrier, trackingUrl, estimatedDelivery } = req.body;

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

    const previousStatus = order.status;
    
    if (status) {
      order.status = status;
      
      if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingCarrier) order.trackingCarrier = trackingCarrier;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    await order.save();

    if (status && status !== previousStatus) {
      try {
        const customer = await User.findById(order.customerId);
        if (customer) {
          await sendOrderStatusUpdateEmail(order, customer, status);
        }
      } catch (emailError) {
        console.error('Error al enviar email de actualización:', emailError);
      }
    }

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

// @desc    Descargar factura PDF de orden
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email')
      .populate('items.productId', 'name')
      .populate('items.producerId', 'businessName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const isCustomer = order.customerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para descargar esta factura'
      });
    }

    const pdfBuffer = await generateInvoicePDF(order, order.customerId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${order.orderNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar factura',
      error: error.message
    });
  }
};
