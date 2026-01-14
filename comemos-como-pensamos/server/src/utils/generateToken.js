import jwt from 'jsonwebtoken';

// Generar JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token válido por 30 días
  });
};

// Generar token de verificación de email (más corto)
export const generateVerificationToken = () => {
  const token = jwt.sign(
    { purpose: 'email-verification', random: Math.random() },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
};

// Generar token de reset de contraseña (muy corto)
export const generateResetToken = () => {
  const token = jwt.sign(
    { purpose: 'password-reset', random: Math.random() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
};

export default generateToken;
