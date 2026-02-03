import stripe from '../config/stripe.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/emailSender.js';
import User from '../models/User.js';
import { notifyPaymentReceived, notifyProducerNewOrder } from '../services/notificationService.js';

// @desc    Crear sesión de checkout de Stripe
// @route   POST /api/stripe/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Stripe no está configurado. Contacta al administrador.'
    });
  }

  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya ha sido pagada'
      });
    }

    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.productName,
          images: item.productId?.images?.slice(0, 1) || []
        },
        unit_amount: Math.round(item.priceAtPurchase * 100)
      },
      quantity: item.quantity
    }));

    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Gastos de envío'
          },
          unit_amount: Math.round(order.shippingCost * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: {
        orderId: order._id.toString()
      },
      customer_email: req.user.email
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sesión de pago',
      error: error.message
    });
  }
};

// @desc    Webhook de Stripe para procesar eventos
// @route   POST /api/stripe/webhook
// @access  Public (verificado por firma)
export const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Stripe no está configurado'
    });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      await handleFailedPayment(paymentIntent);
      break;
    }
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
};

const handleSuccessfulPayment = async (session) => {
  try {
    const orderId = session.metadata.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      console.error('Orden no encontrada para pago exitoso:', orderId);
      return;
    }

    order.paymentStatus = 'paid';
    order.stripePaymentIntentId = session.payment_intent;
    order.status = 'confirmed';
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.reduceStock(item.quantity);
      }
    }

    const user = await User.findById(order.customerId);
    if (user) {
      await sendOrderConfirmationEmail(order, user);
    }

    // Notificaciones push
    try {
      await notifyPaymentReceived(order);
      
      const producerIds = [...new Set(order.items.map(item => item.producerId.toString()))];
      for (const producerId of producerIds) {
        await notifyProducerNewOrder(order, producerId);
      }
    } catch (pushError) {
      console.error('Error al enviar notificaciones push:', pushError);
    }

    console.log(`Pago exitoso para orden ${order.orderNumber}`);
  } catch (error) {
    console.error('Error procesando pago exitoso:', error);
  }
};

const handleFailedPayment = async (paymentIntent) => {
  try {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
      console.log(`Pago fallido para orden ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error procesando pago fallido:', error);
  }
};

// @desc    Verificar estado de pago
// @route   GET /api/stripe/verify-payment/:sessionId
// @access  Private
export const verifyPayment = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Stripe no está configurado'
    });
  }

  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: session.payment_status,
        orderId: session.metadata.orderId
      }
    });
  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar pago',
      error: error.message
    });
  }
};

