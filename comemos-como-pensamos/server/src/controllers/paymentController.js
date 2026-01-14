import stripe from '../config/stripe.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { confirmPayment } from './orderController.js';

// @desc    Crear Payment Intent de Stripe
// @route   POST /api/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la orden'
      });
    }

    // Obtener orden
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario es el dueño de la orden
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para pagar esta orden'
      });
    }

    // Verificar que la orden no ha sido pagada
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya ha sido pagada'
      });
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe usa centavos
      currency: 'eur',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: order.customerId.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Guardar Payment Intent ID en la orden
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Error al crear Payment Intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear intento de pago',
      error: error.message
    });
  }
};

// @desc    Webhook de Stripe
// @route   POST /api/payments/webhook
// @access  Public (pero validado con signature)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar signature del webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Error en webhook de Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment Intent succeeded:', paymentIntent.id);

      // Confirmar orden y reducir stock
      try {
        const orderId = paymentIntent.metadata.orderId;
        await confirmPayment(orderId, paymentIntent.id);
        console.log(`Orden ${orderId} confirmada y stock reducido`);
      } catch (error) {
        console.error('Error al confirmar orden:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment Intent failed:', failedPayment.id);

      // Actualizar estado de orden a failed
      try {
        const orderId = failedPayment.metadata.orderId;
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'failed';
          await order.save();
        }
      } catch (error) {
        console.error('Error al actualizar orden fallida:', error);
      }
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('💰 Refund processed:', refund.id);

      // Actualizar estado de orden a refunded
      try {
        const paymentIntentId = refund.payment_intent;
        const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
        if (order) {
          order.paymentStatus = 'refunded';
          order.status = 'cancelled';
          await order.save();

          // Restaurar stock
          for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
              await product.increaseStock(item.quantity);
            }
          }
        }
      } catch (error) {
        console.error('Error al procesar reembolso:', error);
      }
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  // Responder a Stripe que recibimos el webhook
  res.json({ received: true });
};

// @desc    Obtener estado de pago de una orden
// @route   GET /api/payments/order/:orderId/status
// @access  Private
export const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar permisos
    if (order.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta información'
      });
    }

    let paymentIntentStatus = null;

    // Si hay payment intent, obtener su estado de Stripe
    if (order.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      paymentIntentStatus = paymentIntent.status;
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total,
        stripePaymentIntentId: order.stripePaymentIntentId,
        stripeStatus: paymentIntentStatus
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de pago',
      error: error.message
    });
  }
};
