// api/create-payment-intent.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { 
      amount = 1099, 
      currency = 'usd', 
      email, 
      rideId, 
      seats,
      description 
    } = req.body;

    // Validate required fields
    if (!amount || amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be at least $0.50'
      });
    }

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Customer email is required'
      });
    }

    console.log('Creating payment intent:', {
      amount,
      currency,
      email,
      rideId,
      seats
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency,
      payment_method_types: ['card'],
      description: description || `Ribit ride booking - ${seats} seat(s)`,
      metadata: {
        email: email || '',
        rideId: rideId?.toString() || '',
        seats: seats?.toString() || '',
        platform: 'ribit-mobile-app',
        created_at: new Date().toISOString(),
      },
      // Add receipt email
      receipt_email: email,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);

    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Return appropriate error based on Stripe error type
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'card_error',
        message: error.message
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'invalid_request',
        message: error.message
      });
    } else {
      return res.status(500).json({
        error: 'server_error',
        message: 'An unexpected error occurred while processing your payment'
      });
    }
  }
}