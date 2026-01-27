import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin only)
export const getCoupons = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const coupons = await Coupon.find(filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Coupon.countDocuments(filters);
    
    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { coupons }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones',
      error: error.message
    });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private (Admin only)
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { coupon }
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupón',
      error: error.message
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      isFirstOrderOnly,
      validFrom,
      validUntil,
      maxUses,
      maxUsesPerUser,
      applicableCategories,
      applicableProducers
    } = req.body;
    
    const existingCoupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cupón con este código'
      });
    }
    
    const couponData = {
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      isFirstOrderOnly: isFirstOrderOnly || false,
      maxUsesPerUser: maxUsesPerUser || 1
    };
    
    if (maxDiscountAmount) couponData.maxDiscountAmount = maxDiscountAmount;
    if (validFrom) couponData.validFrom = new Date(validFrom);
    if (validUntil) couponData.validUntil = new Date(validUntil);
    if (maxUses) couponData.maxUses = maxUses;
    if (applicableCategories?.length) couponData.applicableCategories = applicableCategories;
    if (applicableProducers?.length) couponData.applicableProducers = applicableProducers;
    
    const coupon = await Coupon.create(couponData);
    
    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: { coupon }
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cupón',
      error: error.message
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    const {
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      isFirstOrderOnly,
      isActive,
      validFrom,
      validUntil,
      maxUses,
      maxUsesPerUser,
      applicableCategories,
      applicableProducers
    } = req.body;
    
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount || null;
    if (isFirstOrderOnly !== undefined) coupon.isFirstOrderOnly = isFirstOrderOnly;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (validFrom !== undefined) coupon.validFrom = validFrom ? new Date(validFrom) : null;
    if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
    if (maxUses !== undefined) coupon.maxUses = maxUses || null;
    if (maxUsesPerUser !== undefined) coupon.maxUsesPerUser = maxUsesPerUser;
    if (applicableCategories !== undefined) coupon.applicableCategories = applicableCategories;
    if (applicableProducers !== undefined) coupon.applicableProducers = applicableProducers;
    
    await coupon.save();
    
    res.status(200).json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: { coupon }
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cupón',
      error: error.message
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    await Coupon.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cupón',
      error: error.message
    });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user._id;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'El código del cupón es obligatorio'
      });
    }
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no válido'
      });
    }
    
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón ha expirado o no está activo'
      });
    }
    
    if (!coupon.canBeUsedByUser(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Ya has utilizado este cupón'
      });
    }
    
    if (coupon.isFirstOrderOnly) {
      const previousOrders = await Order.countDocuments({ 
        customerId: userId,
        status: { $ne: 'cancelled' }
      });
      
      if (previousOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este cupón es solo para el primer pedido'
        });
      }
    }
    
    if (subtotal && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Pedido mínimo de ${coupon.minOrderAmount}€ para usar este cupón`
      });
    }
    
    const discount = coupon.calculateDiscount(subtotal || 0);
    
    res.status(200).json({
      success: true,
      message: 'Cupón válido',
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscountAmount: coupon.maxDiscountAmount
        },
        discount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar cupón',
      error: error.message
    });
  }
};

// @desc    Apply coupon to order (internal use)
export const applyCouponToOrder = async (couponCode, userId, orderId, orderSubtotal) => {
  const coupon = await Coupon.findOne({ 
    code: couponCode.toUpperCase().trim() 
  });
  
  if (!coupon || !coupon.isValid() || !coupon.canBeUsedByUser(userId)) {
    return { success: false, discount: 0 };
  }
  
  if (coupon.isFirstOrderOnly) {
    const previousOrders = await Order.countDocuments({ 
      customerId: userId,
      status: { $ne: 'cancelled' },
      _id: { $ne: orderId }
    });
    
    if (previousOrders > 0) {
      return { success: false, discount: 0 };
    }
  }
  
  if (orderSubtotal < coupon.minOrderAmount) {
    return { success: false, discount: 0 };
  }
  
  const discount = coupon.calculateDiscount(orderSubtotal);
  
  coupon.usedCount += 1;
  coupon.usedBy.push({ userId, orderId, usedAt: new Date() });
  await coupon.save();
  
  return { success: true, discount, couponId: coupon._id };
};

// @desc    Get coupon stats
// @route   GET /api/coupons/stats
// @access  Private (Admin only)
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usedCount' } } }
    ]);
    
    const topCoupons = await Coupon.find()
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code usedCount discountType discountValue');
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCoupons,
          activeCoupons,
          totalUsage: totalUsage[0]?.total || 0,
          topCoupons
        }
      }
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
