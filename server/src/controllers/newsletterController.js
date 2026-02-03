import NewsletterSubscription from '../models/NewsletterSubscription.js';
import { sendNewsletterWelcomeEmail } from '../utils/emailSender.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source = 'footer', language = 'es' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    // Check if already subscribed
    const existingSubscription = await NewsletterSubscription.findOne({ email: email.toLowerCase() });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está suscrito'
        });
      }
      
      // Reactivate subscription
      existingSubscription.isActive = true;
      existingSubscription.unsubscribedAt = null;
      existingSubscription.subscribedAt = new Date();
      await existingSubscription.save();

      // Send welcome email on reactivation
      try {
        await sendNewsletterWelcomeEmail(email.toLowerCase(), language);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Suscripción reactivada correctamente'
      });
    }

    // Create new subscription
    await NewsletterSubscription.create({
      email: email.toLowerCase(),
      source,
      language
    });

    // Send welcome email
    try {
      await sendNewsletterWelcomeEmail(email.toLowerCase(), language);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Suscrito correctamente al newsletter'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está suscrito'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al suscribirse al newsletter',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    const subscription = await NewsletterSubscription.findOne({ email: email.toLowerCase() });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email no encontrado'
      });
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Te has dado de baja correctamente'
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error al darse de baja',
      error: error.message
    });
  }
};

// @desc    Get all newsletter subscriptions (admin)
// @route   GET /api/newsletter
// @access  Private (Admin only)
export const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const subscriptions = await NewsletterSubscription.find(filters)
      .sort({ subscribedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await NewsletterSubscription.countDocuments(filters);
    const activeCount = await NewsletterSubscription.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      activeCount,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { subscriptions }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripciones',
      error: error.message
    });
  }
};
