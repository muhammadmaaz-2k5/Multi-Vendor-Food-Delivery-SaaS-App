const Stripe = require('stripe');


const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';

const stripeClient = new Stripe(STRIPE_SECRET_KEY);
exports.stripeClient = stripeClient;

