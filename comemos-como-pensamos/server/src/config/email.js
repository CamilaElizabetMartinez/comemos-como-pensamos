import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando email:', error.message);
  } else {
    console.log('✅ Gmail SMTP configurado correctamente');
  }
});

export default transporter;
