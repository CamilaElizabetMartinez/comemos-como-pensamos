import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Producer from '../models/Producer.js';

// Helper to format currency
const formatCurrency = (amount) => `€${(amount || 0).toFixed(2)}`;

// Helper to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Generate Sales Report PDF
export const generateSalesReportPDF = async (filters = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { startDate, endDate, producerId } = filters;
      
      let query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      if (producerId) {
        query['items.producerId'] = producerId;
      }

      const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('items.producerId', 'businessName')
        .sort({ createdAt: -1 });

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).fillColor('#2d5a27').text('Comemos Como Pensamos', { align: 'center' });
      doc.fontSize(16).fillColor('#333').text('Reporte de Ventas', { align: 'center' });
      doc.moveDown();
      
      // Date range
      const dateRange = startDate && endDate 
        ? `${formatDate(startDate)} - ${formatDate(endDate)}`
        : 'Todos los pedidos';
      doc.fontSize(10).fillColor('#666').text(`Período: ${dateRange}`, { align: 'center' });
      doc.text(`Generado: ${formatDate(new Date())}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      doc.fontSize(12).fillColor('#2d5a27').text('Resumen', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.text(`Total de pedidos: ${totalOrders}`);
      doc.text(`Ingresos totales: ${formatCurrency(totalRevenue)}`);
      doc.text(`Valor promedio por pedido: ${formatCurrency(avgOrderValue)}`);
      doc.moveDown(2);

      // Orders table
      doc.fontSize(12).fillColor('#2d5a27').text('Detalle de Pedidos', { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(9).fillColor('#666');
      doc.text('Fecha', 50, tableTop, { width: 70 });
      doc.text('Pedido', 120, tableTop, { width: 100 });
      doc.text('Cliente', 220, tableTop, { width: 120 });
      doc.text('Estado', 340, tableTop, { width: 70 });
      doc.text('Total', 410, tableTop, { width: 80, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#ddd');

      let y = tableTop + 25;
      doc.fillColor('#333');

      for (const order of orders.slice(0, 50)) { // Limit to 50 orders
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const customerName = order.customerId 
          ? `${order.customerId.firstName} ${order.customerId.lastName}`
          : 'N/A';

        doc.text(formatDate(order.createdAt), 50, y, { width: 70 });
        doc.text(order.orderNumber || 'N/A', 120, y, { width: 100 });
        doc.text(customerName, 220, y, { width: 120 });
        doc.text(order.status, 340, y, { width: 70 });
        doc.text(formatCurrency(order.total), 410, y, { width: 80, align: 'right' });
        
        y += 20;
      }

      if (orders.length > 50) {
        doc.moveDown();
        doc.fontSize(8).fillColor('#999').text(`... y ${orders.length - 50} pedidos más`, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate Sales Report Excel
export const generateSalesReportExcel = async (filters = {}) => {
  const { startDate, endDate, producerId } = filters;
  
  let query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (producerId) {
    query['items.producerId'] = producerId;
  }

  const orders = await Order.find(query)
    .populate('customerId', 'firstName lastName email')
    .populate('items.productId', 'name')
    .populate('items.producerId', 'businessName')
    .sort({ createdAt: -1 });

  // Summary sheet data
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const summaryData = [
    ['Reporte de Ventas - Comemos Como Pensamos'],
    [''],
    ['Período', startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Todos'],
    ['Generado', formatDate(new Date())],
    [''],
    ['Total Pedidos', orders.length],
    ['Ingresos Totales', totalRevenue],
    ['Valor Promedio', orders.length > 0 ? totalRevenue / orders.length : 0]
  ];

  // Orders sheet data
  const ordersData = [
    ['Fecha', 'Nº Pedido', 'Cliente', 'Email', 'Productos', 'Subtotal', 'Envío', 'Total', 'Estado', 'Pago']
  ];

  for (const order of orders) {
    const customerName = order.customerId 
      ? `${order.customerId.firstName} ${order.customerId.lastName}`
      : 'N/A';
    const customerEmail = order.customerId?.email || 'N/A';
    const productsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    ordersData.push([
      formatDate(order.createdAt),
      order.orderNumber || 'N/A',
      customerName,
      customerEmail,
      productsCount,
      order.subtotal,
      order.shippingCost,
      order.total,
      order.status,
      order.paymentStatus
    ]);
  }

  // Products detail sheet
  const productsData = [
    ['Fecha', 'Nº Pedido', 'Producto', 'Productor', 'Cantidad', 'Precio Unit.', 'Subtotal']
  ];

  for (const order of orders) {
    for (const item of order.items) {
      productsData.push([
        formatDate(order.createdAt),
        order.orderNumber || 'N/A',
        item.productName || item.productId?.name?.es || 'N/A',
        item.producerId?.businessName || 'N/A',
        item.quantity,
        item.priceAtPurchase,
        item.quantity * item.priceAtPurchase
      ]);
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Pedidos');
  
  const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

// Generate Products Report Excel
export const generateProductsReportExcel = async (producerId = null) => {
  let query = { isAvailable: true };
  if (producerId) {
    query.producerId = producerId;
  }

  const products = await Product.find(query)
    .populate('producerId', 'businessName')
    .sort({ createdAt: -1 });

  const data = [
    ['Nombre', 'Categoría', 'Productor', 'Precio', 'Stock', 'Unidad', 'Rating', 'Reseñas', 'Creado']
  ];

  for (const product of products) {
    data.push([
      product.name?.es || 'N/A',
      product.category || 'N/A',
      product.producerId?.businessName || 'N/A',
      product.price,
      product.stock,
      product.unit,
      product.rating || 0,
      product.numReviews || 0,
      formatDate(product.createdAt)
    ]);
  }

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Productos');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Generate Users Report Excel (Admin only)
export const generateUsersReportExcel = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });

  const data = [
    ['Nombre', 'Apellido', 'Email', 'Rol', 'Verificado', 'Registrado']
  ];

  for (const user of users) {
    data.push([
      user.firstName,
      user.lastName,
      user.email,
      user.role,
      user.isEmailVerified ? 'Sí' : 'No',
      formatDate(user.createdAt)
    ]);
  }

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Usuarios');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

