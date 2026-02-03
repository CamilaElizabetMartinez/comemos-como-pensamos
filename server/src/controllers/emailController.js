import User from '../models/User.js';
import { generateVerificationToken, generateResetToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailSender.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Enviar email de verificación
// @route   POST /api/email/send-verification
// @access  Private
export const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está verificado'
      });
    }

    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Email de verificación enviado'
    });
  } catch (error) {
    console.error('Error al enviar verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email de verificación',
      error: error.message
    });
  }
};

// @desc    Verificar email con token
// @route   GET /api/email/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario con este token
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o expirado'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente'
    });
  } catch (error) {
    console.error('Error al verificar email:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación ha expirado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al verificar email',
      error: error.message
    });
  }
};

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/email/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // No revelar si el email existe o no por seguridad
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud',
      error: error.message
    });
  }
};

// @desc    Restablecer contraseña con token
// @route   POST /api/email/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario con este token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de recuperación inválido o expirado'
      });
    }

    // Actualizar contraseña
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'El token de recuperación ha expirado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña',
      error: error.message
    });
  }
};
