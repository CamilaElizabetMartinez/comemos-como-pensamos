import Producer from '../models/Producer.js';

const REFERRAL_BONUS_COMMISSION = 10;
const REFERRAL_BONUS_DURATION_MONTHS = 3;

// @desc    Validate referral code
// @route   GET /api/referrals/validate/:code
// @access  Public
export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const referrer = await Producer.findOne({ 
      referralCode: code.toUpperCase(),
      isApproved: true
    }).select('businessName referralCode');
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Código de referido no válido'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        referrer: {
          businessName: referrer.businessName,
          code: referrer.referralCode
        }
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar código de referido',
      error: error.message
    });
  }
};

// @desc    Apply referral bonus to both producers
// @route   Internal use
export const applyReferralBonus = async (newProducerId, referralCode) => {
  try {
    const referrer = await Producer.findOne({ 
      referralCode: referralCode.toUpperCase(),
      isApproved: true
    });
    
    if (!referrer) {
      return { success: false, message: 'Referrer not found' };
    }
    
    const newProducer = await Producer.findById(newProducerId);
    if (!newProducer) {
      return { success: false, message: 'New producer not found' };
    }
    
    if (newProducer.referralBonusApplied) {
      return { success: false, message: 'Bonus already applied' };
    }
    
    const bonusEndDate = new Date();
    bonusEndDate.setMonth(bonusEndDate.getMonth() + REFERRAL_BONUS_DURATION_MONTHS);
    
    newProducer.referredBy = referrer._id;
    newProducer.referralBonusApplied = true;
    newProducer.specialCommissionRate = REFERRAL_BONUS_COMMISSION;
    newProducer.specialCommissionUntil = bonusEndDate;
    await newProducer.save();
    
    referrer.referralCount += 1;
    
    if (!referrer.specialCommissionRate || 
        !referrer.specialCommissionUntil || 
        referrer.specialCommissionUntil < new Date()) {
      referrer.specialCommissionRate = REFERRAL_BONUS_COMMISSION;
      referrer.specialCommissionUntil = bonusEndDate;
    } else {
      referrer.specialCommissionUntil = new Date(
        Math.max(referrer.specialCommissionUntil.getTime(), bonusEndDate.getTime())
      );
    }
    await referrer.save();
    
    return { 
      success: true, 
      bonusCommission: REFERRAL_BONUS_COMMISSION,
      bonusEndDate
    };
  } catch (error) {
    console.error('Error applying referral bonus:', error);
    return { success: false, message: error.message };
  }
};

// @desc    Get producer's referral info
// @route   GET /api/referrals/my-referrals
// @access  Private (Producer only)
export const getMyReferrals = async (req, res) => {
  try {
    const producer = await Producer.findOne({ userId: req.user._id })
      .populate({
        path: 'referrals',
        select: 'businessName createdAt isApproved',
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: 'referredBy',
        select: 'businessName'
      });
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Productor no encontrado'
      });
    }
    
    const referralBonus = {
      isActive: producer.specialCommissionRate !== undefined && 
                producer.specialCommissionUntil && 
                new Date() < producer.specialCommissionUntil,
      rate: producer.specialCommissionRate,
      until: producer.specialCommissionUntil
    };
    
    res.status(200).json({
      success: true,
      data: {
        referralCode: producer.referralCode,
        referralCount: producer.referralCount,
        referrals: producer.referrals || [],
        referredBy: producer.referredBy,
        referralBonus,
        bonusDetails: {
          commissionRate: REFERRAL_BONUS_COMMISSION,
          durationMonths: REFERRAL_BONUS_DURATION_MONTHS
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de referidos',
      error: error.message
    });
  }
};

// @desc    Get referral stats for admin
// @route   GET /api/referrals/stats
// @access  Private (Admin only)
export const getReferralStats = async (req, res) => {
  try {
    const totalReferrals = await Producer.countDocuments({ referredBy: { $exists: true } });
    
    const topReferrers = await Producer.aggregate([
      { $match: { referralCount: { $gt: 0 } } },
      { $sort: { referralCount: -1 } },
      { $limit: 10 },
      { $project: { 
        businessName: 1, 
        referralCode: 1, 
        referralCount: 1 
      }}
    ]);
    
    const activeReferralBonuses = await Producer.countDocuments({
      specialCommissionRate: REFERRAL_BONUS_COMMISSION,
      specialCommissionUntil: { $gt: new Date() }
    });
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalReferrals,
          activeReferralBonuses,
          topReferrers,
          bonusCommissionRate: REFERRAL_BONUS_COMMISSION,
          bonusDurationMonths: REFERRAL_BONUS_DURATION_MONTHS
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de referidos',
      error: error.message
    });
  }
};
