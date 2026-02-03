import transporter from '../config/email.js';

const BRAND_COLORS = {
  primary: '#2D5A3D',
  primaryLight: '#3E7A4E',
  accent: '#ff9800',
  textDark: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#999999',
  bgLight: '#f8f9f7',
  bgWhite: '#ffffff',
  border: '#e5e5e5'
};

const emailWrapper = (content, previewText = '') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Comemos Como Pensamos</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 15px !important; }
      .content { padding: 20px !important; }
      .btn { padding: 12px 20px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_COLORS.bgWhite}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryLight} 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">
                🌱 Comemos Como Pensamos
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 35px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.bgLight}; padding: 25px; text-align: center; border-top: 1px solid ${BRAND_COLORS.border};">
              <p style="margin: 0 0 8px 0; color: ${BRAND_COLORS.textMuted}; font-size: 13px;">
                Productos locales, frescos y sostenibles
              </p>
              <p style="margin: 0; color: ${BRAND_COLORS.textLight}; font-size: 11px;">
                © ${new Date().getFullYear()} Comemos Como Pensamos. Todos los derechos reservados.
              </p>
              <p style="margin: 12px 0 0 0;">
                <a href="${process.env.CLIENT_URL}" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-size: 12px; margin: 0 10px;">Inicio</a>
                <a href="${process.env.CLIENT_URL}/products" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-size: 12px; margin: 0 10px;">Productos</a>
                <a href="${process.env.CLIENT_URL}/contact" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-size: 12px; margin: 0 10px;">Contacto</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `Comemos Como Pensamos <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const content = `
    <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0 0 20px 0; font-size: 24px;">¡Bienvenido/a! 👋</h2>
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hola <strong>${user.firstName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.textMuted}; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
      Gracias por unirte a nuestra comunidad de productos locales y sostenibles. 
      Solo falta un paso: verificar tu email.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        Verificar mi email
      </a>
    </div>
    
    <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; margin: 25px 0 0 0;">
      O copia este enlace: <a href="${verificationUrl}" style="color: ${BRAND_COLORS.primary}; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <div style="background: ${BRAND_COLORS.bgLight}; padding: 15px; border-radius: 8px; margin-top: 25px;">
      <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; margin: 0;">
        ⏰ Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este email.
      </p>
    </div>
  `;

  const html = emailWrapper(content, `Hola ${user.firstName}, verifica tu email para completar tu registro.`);
  await sendEmail(user.email, 'Verifica tu email - Comemos Como Pensamos', html);
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const content = `
    <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0 0 20px 0; font-size: 24px;">Recuperar contraseña 🔐</h2>
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hola <strong>${user.firstName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.textMuted}; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
      Recibimos una solicitud para restablecer tu contraseña. 
      Haz clic en el botón para crear una nueva.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        Crear nueva contraseña
      </a>
    </div>
    
    <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; margin: 25px 0 0 0;">
      O copia este enlace: <a href="${resetUrl}" style="color: ${BRAND_COLORS.primary}; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 25px; border-left: 4px solid ${BRAND_COLORS.accent};">
      <p style="color: #856404; font-size: 13px; margin: 0;">
        ⚠️ Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este email.
      </p>
    </div>
  `;

  const html = emailWrapper(content, `Hola ${user.firstName}, sigue las instrucciones para recuperar tu contraseña.`);
  await sendEmail(user.email, 'Recupera tu contraseña - Comemos Como Pensamos', html);
};

export const sendOrderConfirmationEmail = async (order, user) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  let itemsHtml = '';
  order.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border};">
          <span style="font-weight: 500; color: ${BRAND_COLORS.textDark};">${item.productName}</span>
          ${item.variantName ? `<br><span style="font-size: 12px; color: ${BRAND_COLORS.textMuted};">${item.variantName}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: center; color: ${BRAND_COLORS.textMuted};">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: right; font-weight: 500;">€${item.priceAtPurchase.toFixed(2)}</td>
      </tr>
    `;
  });

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
        <span style="font-size: 28px;">✓</span>
      </div>
      <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0; font-size: 24px;">¡Gracias por tu pedido!</h2>
    </div>
    
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${user.firstName}</strong>, tu pedido ha sido confirmado y está siendo procesado.
    </p>

    <div style="background: ${BRAND_COLORS.bgLight}; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <table style="width: 100%;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Nº de pedido</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong style="color: ${BRAND_COLORS.primary};">#${order.orderNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Total</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong style="font-size: 18px;">€${order.total.toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>

    <h3 style="color: ${BRAND_COLORS.textDark}; font-size: 16px; margin: 25px 0 15px 0;">Resumen del pedido</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: ${BRAND_COLORS.bgLight};">
          <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">PRODUCTO</th>
          <th style="padding: 12px 8px; text-align: center; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">CANT.</th>
          <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">PRECIO</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <table style="width: 100%; margin-top: 15px;">
      <tr>
        <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted};">Subtotal</td>
        <td style="padding: 8px 0; text-align: right;">€${order.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted};">Envío</td>
        <td style="padding: 8px 0; text-align: right;">${order.shippingCost > 0 ? `€${order.shippingCost.toFixed(2)}` : '<span style="color: ' + BRAND_COLORS.primary + ';">Gratis</span>'}</td>
      </tr>
      ${order.discount ? `
      <tr>
        <td style="padding: 8px 0; color: ${BRAND_COLORS.primary};">Descuento</td>
        <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.primary};">-€${order.discount.toFixed(2)}</td>
      </tr>
      ` : ''}
      <tr style="border-top: 2px solid ${BRAND_COLORS.border};">
        <td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: ${BRAND_COLORS.primary};">€${order.total.toFixed(2)}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        Ver mi pedido
      </a>
    </div>

    <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; text-align: center; margin-top: 20px;">
      📬 Te enviaremos actualizaciones sobre el estado de tu pedido.
    </p>
  `;

  const html = emailWrapper(content, `¡Pedido #${order.orderNumber} confirmado! Total: €${order.total.toFixed(2)}`);
  await sendEmail(user.email, `✓ Pedido #${order.orderNumber} confirmado`, html);
};

export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  const statusConfig = {
    confirmed: { emoji: '✅', message: 'Tu pedido ha sido confirmado', color: BRAND_COLORS.primary },
    preparing: { emoji: '👨‍🍳', message: 'Tu pedido está siendo preparado', color: '#ff9800' },
    shipped: { emoji: '🚚', message: '¡Tu pedido está en camino!', color: '#2196f3' },
    delivered: { emoji: '📦', message: '¡Tu pedido ha sido entregado!', color: BRAND_COLORS.primary },
    cancelled: { emoji: '❌', message: 'Tu pedido ha sido cancelado', color: '#f44336' }
  };

  const config = statusConfig[newStatus] || { emoji: '📋', message: 'Tu pedido ha sido actualizado', color: BRAND_COLORS.primary };

  const trackingSection = order.trackingNumber ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1565c0;">📍 Seguimiento de envío</p>
      <p style="margin: 0; color: ${BRAND_COLORS.textMuted};">
        <strong>Nº seguimiento:</strong> ${order.trackingNumber}
        ${order.carrier ? `<br><strong>Transportista:</strong> ${order.carrier}` : ''}
        ${order.trackingUrl ? `<br><a href="${order.trackingUrl}" style="color: #1565c0;">Ver seguimiento →</a>` : ''}
      </p>
    </div>
  ` : '';

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 48px; margin-bottom: 15px;">${config.emoji}</div>
      <h2 style="color: ${config.color}; margin: 0; font-size: 22px;">${config.message}</h2>
    </div>
    
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
      Hola <strong>${user.firstName}</strong>
    </p>

    <div style="background: ${BRAND_COLORS.bgLight}; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <table style="width: 100%;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Nº de pedido</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong style="color: ${BRAND_COLORS.primary};">#${order.orderNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Estado actual</span></td>
          <td style="padding: 5px 0; text-align: right;">
            <span style="background: ${config.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
            </span>
          </td>
        </tr>
      </table>
      ${trackingSection}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        Ver detalles del pedido
      </a>
    </div>

    <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; text-align: center; margin-top: 20px;">
      ¿Tienes preguntas? <a href="${process.env.CLIENT_URL}/contact" style="color: ${BRAND_COLORS.primary};">Contáctanos</a>
    </p>
  `;

  const html = emailWrapper(content, `${config.emoji} ${config.message} - Pedido #${order.orderNumber}`);
  await sendEmail(user.email, `${config.emoji} Pedido #${order.orderNumber} - ${config.message}`, html);
};

export const sendNewOrderToProducerEmail = async (order, producer, producerUser) => {
  const orderUrl = `${process.env.CLIENT_URL}/producer/orders`;

  const producerItems = order.items.filter(item =>
    item.producerId.toString() === producer._id.toString()
  );

  let itemsHtml = '';
  let producerTotal = 0;
  producerItems.forEach(item => {
    const itemTotal = item.priceAtPurchase * item.quantity;
    producerTotal += itemTotal;
    itemsHtml += `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border};">
          <span style="font-weight: 500; color: ${BRAND_COLORS.textDark};">${item.productName}</span>
          ${item.variantName ? `<br><span style="font-size: 12px; color: ${BRAND_COLORS.textMuted};">${item.variantName}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: center; color: ${BRAND_COLORS.textMuted};">×${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: right; font-weight: 500;">€${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🛒</div>
      <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0; font-size: 22px;">¡Nueva orden recibida!</h2>
    </div>
    
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${producerUser.firstName}</strong>, tienes una nueva orden en <strong>${producer.businessName}</strong>.
    </p>

    <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 20px; border-radius: 10px; margin: 20px 0;">
      <table style="width: 100%;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Nº de pedido</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong style="color: ${BRAND_COLORS.primary};">#${order.orderNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Cliente</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><span style="color: ${BRAND_COLORS.textMuted};">Tu total</span></td>
          <td style="padding: 5px 0; text-align: right;"><strong style="font-size: 20px; color: ${BRAND_COLORS.primary};">€${producerTotal.toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>

    <h3 style="color: ${BRAND_COLORS.textDark}; font-size: 16px; margin: 25px 0 15px 0;">Productos solicitados</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: ${BRAND_COLORS.bgLight};">
          <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">PRODUCTO</th>
          <th style="padding: 12px 8px; text-align: center; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">CANT.</th>
          <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: ${BRAND_COLORS.textMuted}; font-weight: 600;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background: ${BRAND_COLORS.bgLight}; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>📍 Enviar a:</strong></p>
      <p style="margin: 8px 0 0 0; color: ${BRAND_COLORS.textMuted}; font-size: 14px;">
        ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.region}
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        Ver en mi panel
      </a>
    </div>
  `;

  const html = emailWrapper(content, `Nueva orden #${order.orderNumber} - ${producerItems.length} producto(s) - €${producerTotal.toFixed(2)}`);
  await sendEmail(producerUser.email, `🛒 Nueva orden #${order.orderNumber} - ${producer.businessName}`, html);
};

export const sendReviewRequestEmail = async (order, user) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  let productsHtml = '';
  order.items.forEach(item => {
    productsHtml += `
      <div style="background: ${BRAND_COLORS.bgLight}; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: table; width: 100%;">
        <div style="display: table-cell; vertical-align: middle;">
          <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.textDark};">${item.productName}</p>
          ${item.variantName ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: ${BRAND_COLORS.textMuted};">${item.variantName}</p>` : ''}
        </div>
        <div style="display: table-cell; vertical-align: middle; text-align: right; width: 100px;">
          <span style="color: #ffc107; font-size: 18px;">☆☆☆☆☆</span>
        </div>
      </div>
    `;
  });

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 48px; margin-bottom: 10px;">⭐</div>
      <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0; font-size: 22px;">¿Qué te pareció tu pedido?</h2>
    </div>
    
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      Hola <strong>${user.firstName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.textMuted}; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
      Esperamos que estés disfrutando de tu pedido <strong>#${order.orderNumber}</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, #fff8e1, #fffde7); padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #ffe082;">
      <p style="font-size: 16px; margin: 0 0 8px 0; color: ${BRAND_COLORS.textDark};">
        <strong>Tu opinión importa</strong>
      </p>
      <p style="color: ${BRAND_COLORS.textMuted}; margin: 0; font-size: 14px;">
        Ayuda a otros compradores y apoya a nuestros productores locales 🌱
      </p>
    </div>

    <h3 style="color: ${BRAND_COLORS.textDark}; font-size: 15px; margin: 25px 0 15px 0;">Productos para valorar:</h3>
    ${productsHtml}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderUrl}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.accent}, #ffa726); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        ⭐ Dejar mi opinión
      </a>
    </div>

    <p style="text-align: center; color: ${BRAND_COLORS.textLight}; font-size: 13px;">
      Solo te tomará un minuto
    </p>
  `;

  const html = emailWrapper(content, `¿Qué te pareció tu pedido #${order.orderNumber}? Déjanos tu opinión.`);
  await sendEmail(user.email, `⭐ ¿Qué te pareció tu pedido #${order.orderNumber}?`, html);
};

export const sendNewsletterWelcomeEmail = async (email, language = 'es') => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const translations = {
    es: {
      subject: '¡Bienvenido al newsletter de Comemos Como Pensamos!',
      greeting: 'Hola,',
      intro: 'Te damos la bienvenida a nuestra comunidad de amantes de los productos locales y sostenibles.',
      whatYouGet: 'Qué recibirás:',
      benefits: [
        '🌱 Novedades de nuestros productores locales',
        '🎁 Ofertas y descuentos exclusivos',
        '📚 Recetas y consejos de alimentación consciente',
        '🆕 Nuevos productos antes que nadie'
      ],
      cta: 'Explorar productos',
      unsubscribe: 'Si no deseas recibir nuestros emails, puedes',
      unsubscribeLink: 'darte de baja aquí'
    },
    en: {
      subject: 'Welcome to Comemos Como Pensamos newsletter!',
      greeting: 'Hello,',
      intro: 'Welcome to our community of local and sustainable product lovers.',
      whatYouGet: 'What you\'ll receive:',
      benefits: [
        '🌱 News from our local producers',
        '🎁 Exclusive offers and discounts',
        '📚 Recipes and conscious eating tips',
        '🆕 New products before anyone else'
      ],
      cta: 'Explore products',
      unsubscribe: 'If you don\'t want to receive our emails, you can',
      unsubscribeLink: 'unsubscribe here'
    }
  };

  const texts = translations[language] || translations.es;

  const benefitsHtml = texts.benefits
    .map(benefit => `<li style="margin-bottom: 10px; color: ${BRAND_COLORS.textMuted};">${benefit}</li>`)
    .join('');

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
      <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0; font-size: 22px;">¡Gracias por suscribirte!</h2>
    </div>
    
    <p style="color: ${BRAND_COLORS.textDark}; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
      ${texts.greeting}
    </p>
    <p style="color: ${BRAND_COLORS.textMuted}; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
      ${texts.intro}
    </p>
    
    <div style="background: ${BRAND_COLORS.bgLight}; padding: 20px 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
      <h3 style="color: ${BRAND_COLORS.primary}; margin: 0 0 15px 0; font-size: 16px;">${texts.whatYouGet}</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        ${benefitsHtml}
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/products" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        ${texts.cta}
      </a>
    </div>

    <p style="text-align: center; color: ${BRAND_COLORS.textLight}; font-size: 12px; margin-top: 30px;">
      ${texts.unsubscribe} <a href="${unsubscribeUrl}" style="color: ${BRAND_COLORS.primary};">${texts.unsubscribeLink}</a>
    </p>
  `;

  const html = emailWrapper(content, texts.intro);
  await sendEmail(email, texts.subject, html);
};

export const sendContactNotificationEmail = async (contact) => {
  const subjectLabels = {
    general: 'Consulta General',
    order: 'Sobre un Pedido',
    product: 'Sobre un Producto',
    producer: 'Ser Productor',
    technical: 'Soporte Técnico',
    other: 'Otro'
  };

  const subjectColors = {
    general: '#2196f3',
    order: '#ff9800',
    product: '#4caf50',
    producer: '#9c27b0',
    technical: '#f44336',
    other: '#607d8b'
  };

  const subjectLabel = subjectLabels[contact.subject] || contact.subject;
  const subjectColor = subjectColors[contact.subject] || '#607d8b';

  const content = `
    <h2 style="color: ${BRAND_COLORS.textDark}; margin: 0 0 20px 0; font-size: 22px;">📬 Nuevo mensaje de contacto</h2>
    
    <div style="background: ${BRAND_COLORS.bgLight}; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <table style="width: 100%;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted}; width: 100px;">Nombre</td>
          <td style="padding: 8px 0;"><strong>${contact.name}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted};">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${contact.email}" style="color: ${BRAND_COLORS.primary};">${contact.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted};">Asunto</td>
          <td style="padding: 8px 0;">
            <span style="background: ${subjectColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              ${subjectLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.textMuted};">Fecha</td>
          <td style="padding: 8px 0;">${new Date(contact.createdAt).toLocaleString('es-ES')}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: ${BRAND_COLORS.textDark}; font-size: 16px; margin: 25px 0 15px 0;">Mensaje:</h3>
    <div style="background: white; border: 1px solid ${BRAND_COLORS.border}; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6; color: ${BRAND_COLORS.textDark};">${contact.message}</div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${contact.email}?subject=Re: ${subjectLabel}" class="btn"
         style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight}); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
        ↩️ Responder a ${contact.name}
      </a>
    </div>
  `;

  const html = emailWrapper(content, `Nuevo mensaje de ${contact.name}: ${subjectLabel}`);
  await sendEmail(process.env.GMAIL_USER, `📬 [Contacto] ${subjectLabel} - ${contact.name}`, html);
};

export default sendEmail;
