import { sendPushToUser, sendPushToUsers } from '../controllers/pushController.js';
import User from '../models/User.js';

// Notification for customer when order status changes
export const notifyOrderStatusChange = async (order, newStatus) => {
  const statusMessages = {
    confirmed: {
      title: '✅ Pedido confirmado',
      body: `Tu pedido #${order.orderNumber} ha sido confirmado`
    },
    preparing: {
      title: '👨‍🍳 Preparando tu pedido',
      body: `Tu pedido #${order.orderNumber} está siendo preparado`
    },
    shipped: {
      title: '🚚 Pedido enviado',
      body: `Tu pedido #${order.orderNumber} está en camino`
    },
    delivered: {
      title: '📦 Pedido entregado',
      body: `Tu pedido #${order.orderNumber} ha sido entregado. ¡Disfrútalo!`
    },
    cancelled: {
      title: '❌ Pedido cancelado',
      body: `Tu pedido #${order.orderNumber} ha sido cancelado`
    }
  };

  const message = statusMessages[newStatus];
  if (!message) return;

  try {
    await sendPushToUser(order.customerId, {
      ...message,
      data: { url: `/orders/${order._id}` },
      tag: `order-${order._id}`
    });
    console.log(`Push notification sent to customer for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending order status push:', error);
  }
};

// Notification for producer when new order received
export const notifyProducerNewOrder = async (order, producerId) => {
  try {
    // Find the producer's user ID
    const Producer = (await import('../models/Producer.js')).default;
    const producer = await Producer.findById(producerId);
    
    if (!producer) return;

    const itemsForProducer = order.items.filter(
      item => item.producerId.toString() === producerId.toString()
    );
    const itemCount = itemsForProducer.reduce((sum, item) => sum + item.quantity, 0);

    await sendPushToUser(producer.userId, {
      title: '🛒 ¡Nuevo pedido!',
      body: `Has recibido un pedido con ${itemCount} producto(s) - #${order.orderNumber}`,
      data: { url: `/producer/orders` },
      tag: `new-order-${order._id}`
    });
    console.log(`Push notification sent to producer ${producer.businessName}`);
  } catch (error) {
    console.error('Error sending new order push to producer:', error);
  }
};

// Notification to all admins when new producer registration pending
export const notifyAdminNewProducer = async (producer) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);

    if (adminIds.length === 0) return;

    await sendPushToUsers(adminIds, {
      title: '👤 Nuevo productor pendiente',
      body: `${producer.businessName} solicita aprobación como productor`,
      data: { url: '/admin/producers' },
      tag: `new-producer-${producer._id}`
    });
    console.log(`Push notification sent to ${adminIds.length} admin(s)`);
  } catch (error) {
    console.error('Error sending new producer push to admins:', error);
  }
};

// Notification to producer when approved/rejected
export const notifyProducerApproval = async (producer, approved) => {
  try {
    const notification = approved
      ? {
          title: '🎉 ¡Cuenta aprobada!',
          body: 'Tu cuenta de productor ha sido aprobada. ¡Ya puedes empezar a vender!',
          data: { url: '/producer' }
        }
      : {
          title: '❌ Solicitud rechazada',
          body: 'Tu solicitud de productor ha sido rechazada. Contacta con soporte para más información.',
          data: { url: '/contact' }
        };

    await sendPushToUser(producer.userId, {
      ...notification,
      tag: `producer-approval-${producer._id}`
    });
    console.log(`Push notification sent to producer ${producer.businessName} - ${approved ? 'approved' : 'rejected'}`);
  } catch (error) {
    console.error('Error sending producer approval push:', error);
  }
};

// Notification to customer for order confirmation
export const notifyOrderConfirmation = async (order) => {
  try {
    await sendPushToUser(order.customerId, {
      title: '🎉 ¡Pedido realizado!',
      body: `Tu pedido #${order.orderNumber} ha sido recibido correctamente`,
      data: { url: `/orders/${order._id}` },
      tag: `order-created-${order._id}`
    });
    console.log(`Push notification sent for new order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending order confirmation push:', error);
  }
};

// Notification for payment received
export const notifyPaymentReceived = async (order) => {
  try {
    await sendPushToUser(order.customerId, {
      title: '💰 Pago recibido',
      body: `Hemos recibido el pago de tu pedido #${order.orderNumber}`,
      data: { url: `/orders/${order._id}` },
      tag: `payment-${order._id}`
    });
    console.log(`Push notification sent for payment ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending payment push:', error);
  }
};




