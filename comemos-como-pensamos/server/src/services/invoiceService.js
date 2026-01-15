import PDFDocument from 'pdfkit';

const COMPANY_INFO = {
  name: 'Comemos Como Pensamos S.L.',
  address: 'Calle Principal 123',
  city: '28001 Madrid, España',
  cif: 'B12345678',
  email: 'info@comemoscomopensamos.es',
  phone: '+34 900 123 456'
};

export const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      generateHeader(doc);
      generateCustomerInformation(doc, order, user);
      generateInvoiceTable(doc, order);
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateHeader = (doc) => {
  doc
    .fillColor('#2d5016')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('FACTURA', 50, 50)
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#333333')
    .text(COMPANY_INFO.name, 200, 50, { align: 'right' })
    .text(COMPANY_INFO.address, 200, 65, { align: 'right' })
    .text(COMPANY_INFO.city, 200, 80, { align: 'right' })
    .text(`CIF: ${COMPANY_INFO.cif}`, 200, 95, { align: 'right' })
    .text(COMPANY_INFO.email, 200, 110, { align: 'right' })
    .moveDown();

  doc
    .strokeColor('#2d5016')
    .lineWidth(2)
    .moveTo(50, 140)
    .lineTo(550, 140)
    .stroke();
};

const generateCustomerInformation = (doc, order, user) => {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Factura Nº:', 50, 160)
    .font('Helvetica')
    .text(order.orderNumber, 150, 160)
    .font('Helvetica-Bold')
    .text('Fecha:', 50, 175)
    .font('Helvetica')
    .text(invoiceDate, 150, 175)
    .font('Helvetica-Bold')
    .text('Estado:', 50, 190)
    .font('Helvetica')
    .text(getStatusLabel(order.status), 150, 190);

  doc
    .font('Helvetica-Bold')
    .text('Facturar a:', 350, 160)
    .font('Helvetica')
    .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 350, 175)
    .text(order.shippingAddress.street, 350, 190)
    .text(`${order.shippingAddress.postalCode} ${order.shippingAddress.city}`, 350, 205)
    .text(order.shippingAddress.country, 350, 220)
    .text(user?.email || '', 350, 235);

  doc.moveDown(4);
};

const generateInvoiceTable = (doc, order) => {
  const tableTop = 280;
  const itemCodeX = 50;
  const descriptionX = 100;
  const quantityX = 350;
  const priceX = 420;
  const amountX = 490;

  doc
    .fillColor('#2d5016')
    .rect(50, tableTop - 5, 500, 20)
    .fill();

  doc
    .fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('#', itemCodeX, tableTop)
    .text('Descripción', descriptionX, tableTop)
    .text('Cant.', quantityX, tableTop)
    .text('Precio', priceX, tableTop)
    .text('Total', amountX, tableTop);

  doc.fillColor('#333333').font('Helvetica');

  let currentY = tableTop + 30;
  order.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.priceAtPurchase;

    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    doc
      .fontSize(9)
      .text(index + 1, itemCodeX, currentY)
      .text(truncateText(item.productName, 40), descriptionX, currentY)
      .text(item.quantity, quantityX, currentY)
      .text(`€${item.priceAtPurchase.toFixed(2)}`, priceX, currentY)
      .text(`€${itemTotal.toFixed(2)}`, amountX, currentY);

    currentY += 25;
  });

  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, currentY + 10)
    .lineTo(550, currentY + 10)
    .stroke();

  currentY += 30;

  doc
    .fontSize(10)
    .text('Subtotal:', 380, currentY)
    .text(`€${order.subtotal.toFixed(2)}`, amountX, currentY);

  currentY += 20;
  doc
    .text('Gastos de envío:', 380, currentY)
    .text(`€${order.shippingCost.toFixed(2)}`, amountX, currentY);

  currentY += 25;
  doc
    .strokeColor('#2d5016')
    .lineWidth(2)
    .moveTo(380, currentY - 5)
    .lineTo(550, currentY - 5)
    .stroke();

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#2d5016')
    .text('TOTAL:', 380, currentY)
    .text(`€${order.total.toFixed(2)}`, amountX, currentY);

  currentY += 40;

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Método de pago: ${getPaymentMethodLabel(order.paymentMethod)}`, 50, currentY)
    .text(`Estado del pago: ${getPaymentStatusLabel(order.paymentStatus)}`, 50, currentY + 15);
};

const generateFooter = (doc) => {
  doc
    .fontSize(8)
    .fillColor('#666666')
    .text(
      'Gracias por su compra. Para cualquier consulta, contacte con nosotros en info@comemoscomopensamos.es',
      50,
      750,
      { align: 'center', width: 500 }
    );
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    card: 'Tarjeta de crédito/débito',
    bank_transfer: 'Transferencia bancaria',
    cash_on_delivery: 'Pago contra entrega'
  };
  return labels[method] || method;
};

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  };
  return labels[status] || status;
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export default { generateInvoicePDF };

