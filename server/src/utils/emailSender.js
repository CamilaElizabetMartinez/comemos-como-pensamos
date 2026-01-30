import transporter from '../config/email.js';

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `Comemos Como Pensamos <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">¡Bienvenido a Comemos Como Pensamos!</h2>
      <p>Hola ${user.firstName},</p>
      <p>Gracias por registrarte. Por favor verifica tu email haciendo clic en el botón de abajo:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}"
           style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verificar Email
        </a>
      </div>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>Este enlace expira en 24 horas.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Si no creaste una cuenta, puedes ignorar este email.</p>
    </div>
  `;

  await sendEmail(user.email, 'Verifica tu email - Comemos Como Pensamos', html);
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">Recuperación de Contraseña</h2>
      <p>Hola ${user.firstName},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>Este enlace expira en 1 hora.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.</p>
    </div>
  `;

  await sendEmail(user.email, 'Restablece tu contraseña - Comemos Como Pensamos', html);
};

export const sendOrderConfirmationEmail = async (order, user) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  let itemsHtml = '';
  order.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.priceAtPurchase.toFixed(2)}</td>
      </tr>
    `;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">¡Gracias por tu pedido!</h2>
      <p>Hola ${user.firstName},</p>
      <p>Tu pedido ha sido confirmado y está siendo procesado.</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Número de orden:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Total:</strong> €${order.total.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Estado:</strong> ${order.status}</p>
      </div>

      <h3>Detalles del pedido:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: center;">Cantidad</th>
            <th style="padding: 10px; text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 10px; text-align: right;">€${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Envío:</strong></td>
            <td style="padding: 10px; text-align: right;">€${order.shippingCost.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 18px; font-weight: bold;">
            <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
            <td style="padding: 10px; text-align: right;">€${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}"
           style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Ver mi pedido
        </a>
      </div>

      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Recibirás actualizaciones sobre tu pedido por email.</p>
    </div>
  `;

  await sendEmail(user.email, `Confirmación de pedido #${order.orderNumber}`, html);
};

export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  const statusMessages = {
    confirmed: 'Tu pedido ha sido confirmado',
    preparing: 'Tu pedido está siendo preparado',
    shipped: 'Tu pedido ha sido enviado',
    delivered: 'Tu pedido ha sido entregado',
    cancelled: 'Tu pedido ha sido cancelado'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">Actualización de tu pedido</h2>
      <p>Hola ${user.firstName},</p>
      <p><strong>${statusMessages[newStatus] || 'Tu pedido ha sido actualizado'}</strong></p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Número de orden:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Estado:</strong> ${newStatus}</p>
        ${order.trackingNumber ? `<p style="margin: 5px 0;"><strong>Número de seguimiento:</strong> ${order.trackingNumber}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}"
           style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Ver detalles
        </a>
      </div>

      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Si tienes preguntas sobre tu pedido, contáctanos.</p>
    </div>
  `;

  await sendEmail(user.email, `Actualización de pedido #${order.orderNumber}`, html);
};

export const sendNewOrderToProducerEmail = async (order, producer, producerUser) => {
  const orderUrl = `${process.env.CLIENT_URL}/producer/orders/${order._id}`;

  const producerItems = order.items.filter(item =>
    item.producerId.toString() === producer._id.toString()
  );

  let itemsHtml = '';
  producerItems.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">¡Nueva Orden Recibida!</h2>
      <p>Hola ${producerUser.firstName},</p>
      <p>Has recibido una nueva orden en ${producer.businessName}.</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Número de orden:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
      </div>

      <h3>Productos solicitados:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: center;">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}"
           style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Ver orden completa
        </a>
      </div>

      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Accede a tu panel de productor para más detalles.</p>
    </div>
  `;

  await sendEmail(producerUser.email, `Nueva orden #${order.orderNumber} - ${producer.businessName}`, html);
};

export const sendReviewRequestEmail = async (order, user) => {
  const orderUrl = `${process.env.CLIENT_URL}/orders/${order._id}`;

  let productsHtml = '';
  order.items.forEach(item => {
    productsHtml += `
      <div style="display: flex; align-items: center; padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 10px;">
        <div style="flex: 1;">
          <p style="margin: 0; font-weight: 600; color: #333;">${item.productName}</p>
        </div>
        <div style="text-align: right;">
          <span style="color: #ffc107; font-size: 20px;">★★★★★</span>
        </div>
      </div>
    `;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32; text-align: center;">¡Tu pedido ha sido entregado! 📦</h2>
      <p>Hola ${user.firstName},</p>
      <p>Esperamos que estés disfrutando de tu pedido <strong>#${order.orderNumber}</strong>.</p>
      
      <div style="background: linear-gradient(135deg, #fff8e1, #fffde7); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="font-size: 18px; margin: 0 0 10px 0; color: #333;">
          <strong>¿Qué te parecieron los productos?</strong>
        </p>
        <p style="color: #666; margin: 0;">
          Tu opinión ayuda a otros compradores y a nuestros productores locales 🌱
        </p>
      </div>

      <h3 style="color: #333;">Productos para valorar:</h3>
      ${productsHtml}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderUrl}"
           style="background: linear-gradient(135deg, #ff9800, #ffa726); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
          ⭐ Dejar mi opinión
        </a>
      </div>

      <p style="text-align: center; color: #666; font-size: 14px;">
        Solo te tomará un minuto y nos ayuda mucho.
      </p>

      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        ¿Algún problema con tu pedido? <a href="${process.env.CLIENT_URL}/contact" style="color: #2e7d32;">Contáctanos</a>
      </p>
    </div>
  `;

  await sendEmail(user.email, `⭐ ¿Qué te pareció tu pedido #${order.orderNumber}?`, html);
};

export const sendNewsletterWelcomeEmail = async (email, language = 'es') => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = {
    es: {
      subject: '¡Bienvenido al newsletter de Comemos Como Pensamos!',
      title: '¡Gracias por suscribirte!',
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
      title: 'Thanks for subscribing!',
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

  const texts = content[language] || content.es;

  const benefitsHtml = texts.benefits
    .map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #2D5A3D 0%, #3E7A4E 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${texts.title}</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333;">${texts.greeting}</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">${texts.intro}</p>
        
        <div style="background: #f8f9f7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2D5A3D;">
          <h3 style="color: #2D5A3D; margin: 0 0 15px 0;">${texts.whatYouGet}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
            ${benefitsHtml}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/products"
             style="background-color: #2D5A3D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            ${texts.cta}
          </a>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          ${texts.unsubscribe} <a href="${unsubscribeUrl}" style="color: #2D5A3D;">${texts.unsubscribeLink}</a>
        </p>
        <p style="color: #aaa; font-size: 11px; margin: 10px 0 0 0;">
          © 2026 Comemos Como Pensamos
        </p>
      </div>
    </div>
  `;

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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">Nuevo mensaje de contacto</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 8px 0;"><strong>Nombre:</strong> ${contact.name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${contact.email}</p>
        <p style="margin: 8px 0;"><strong>Asunto:</strong> ${subjectLabels[contact.subject] || contact.subject}</p>
        <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date(contact.createdAt).toLocaleString('es-ES')}</p>
      </div>

      <h3>Mensaje:</h3>
      <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
${contact.message}
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
        <p style="margin: 0; color: #2e7d32;"><strong>Responder directamente:</strong> 
          <a href="mailto:${contact.email}?subject=Re: ${subjectLabels[contact.subject]}" style="color: #2e7d32;">${contact.email}</a>
        </p>
      </div>

      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de Comemos Como Pensamos.</p>
    </div>
  `;

  await sendEmail(process.env.GMAIL_USER, `[Contacto] ${subjectLabels[contact.subject]} - ${contact.name}`, html);
};

export default sendEmail;
