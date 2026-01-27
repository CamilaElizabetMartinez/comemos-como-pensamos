import {
  generateSalesReportPDF,
  generateSalesReportExcel,
  generateProductsReportExcel,
  generateUsersReportExcel
} from '../services/reportService.js';
import Producer from '../models/Producer.js';

// @desc    Download sales report PDF
// @route   GET /api/reports/sales/pdf
// @access  Private (Admin or Producer)
export const downloadSalesReportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let producerId = null;
    
    // If producer, only their sales
    if (req.user.role === 'producer') {
      const producer = await Producer.findOne({ userId: req.user._id });
      if (!producer) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de productor no encontrado'
        });
      }
      producerId = producer._id;
    }

    const pdfBuffer = await generateSalesReportPDF({
      startDate,
      endDate,
      producerId
    });

    const filename = `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating sales PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte PDF',
      error: error.message
    });
  }
};

// @desc    Download sales report Excel
// @route   GET /api/reports/sales/excel
// @access  Private (Admin or Producer)
export const downloadSalesReportExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let producerId = null;
    
    if (req.user.role === 'producer') {
      const producer = await Producer.findOne({ userId: req.user._id });
      if (!producer) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de productor no encontrado'
        });
      }
      producerId = producer._id;
    }

    const excelBuffer = await generateSalesReportExcel({
      startDate,
      endDate,
      producerId
    });

    const filename = `reporte-ventas-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating sales Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte Excel',
      error: error.message
    });
  }
};

// @desc    Download products report Excel
// @route   GET /api/reports/products/excel
// @access  Private (Admin or Producer)
export const downloadProductsReportExcel = async (req, res) => {
  try {
    let producerId = null;
    
    if (req.user.role === 'producer') {
      const producer = await Producer.findOne({ userId: req.user._id });
      if (!producer) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de productor no encontrado'
        });
      }
      producerId = producer._id;
    }

    const excelBuffer = await generateProductsReportExcel(producerId);

    const filename = `reporte-productos-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating products Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte Excel',
      error: error.message
    });
  }
};

// @desc    Download users report Excel
// @route   GET /api/reports/users/excel
// @access  Private (Admin only)
export const downloadUsersReportExcel = async (req, res) => {
  try {
    const excelBuffer = await generateUsersReportExcel();

    const filename = `reporte-usuarios-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating users Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte Excel',
      error: error.message
    });
  }
};











