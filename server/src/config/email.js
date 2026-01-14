import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Verificar configuración
if (process.env.RESEND_API_KEY) {
  console.log('✅ Email service (Resend) configurado');
} else {
  console.error('❌ RESEND_API_KEY no configurada');
}

export default resend;