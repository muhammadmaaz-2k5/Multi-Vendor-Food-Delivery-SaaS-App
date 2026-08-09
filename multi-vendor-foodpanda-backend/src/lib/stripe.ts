import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';

export const stripeClient = new Stripe(STRIPE_SECRET_KEY);
