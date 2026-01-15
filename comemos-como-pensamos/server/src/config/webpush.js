import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:info@comemoscomopensamos.es',
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('✅ Web Push configurado correctamente');
} else {
  console.warn('⚠️ Web Push no configurado: faltan claves VAPID en .env');
}

export default webpush;
export { vapidPublicKey };

