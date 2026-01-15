import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

let stripe = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });
  console.log('✅ Stripe configurado correctamente');
} else {
  console.log('⚠️  Stripe no configurado (STRIPE_SECRET_KEY no definido)');
}

export default stripe;
