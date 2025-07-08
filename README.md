# Ribit Stripe API Server

This is a serverless Stripe payment API built for Vercel to handle payment processing for the Ribit ride-sharing mobile app.

## Quick Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Clone and Setup
```bash
# Create new directory for the Stripe API
mkdir ribit-stripe-api
cd ribit-stripe-api

# Copy the files from this artifact
# Add your package.json, vercel.json, and api/ folder

# Install dependencies
npm install
```

### 3. Set Environment Variables
```bash
# Set your Stripe keys in Vercel
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY

# Or create .env.local for local development
cp .env.example .env.local
# Edit .env.local with your actual Stripe keys
```

### 4. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## API Endpoints

### POST /api/create-payment-intent
Creates a Stripe payment intent for processing payments.

**Request Body:**
```json
{
  "amount": 1099,
  "currency": "usd",
  "email": "user@example.edu",
  "rideId": "ride_123",
  "seats": 2,
  "description": "Ribit ride booking"
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_...",
  "amount": 1099,
  "currency": "usd"
}
```

### GET /api/health
Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "ribit-stripe-api",
  "timestamp": "2025-01-08T...",
  "version": "1.0.0"
}
```

## Local Development

```bash
# Start local development server
vercel dev

# Test the health endpoint
curl http://localhost:3000/api/health

# Test payment intent creation
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1099, "email": "test@example.edu", "rideId": "test_ride"}'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Security Features

- CORS enabled for mobile app requests
- Input validation for all parameters
- Stripe webhook signature verification (when implemented)
- Error handling with appropriate HTTP status codes
- Request logging for debugging

## Monitoring

- Health check endpoint for uptime monitoring
- Structured error logging
- Payment intent metadata for tracking

## Next Steps

1. Set up Stripe webhooks for payment confirmation
2. Add webhook endpoint for handling payment events
3. Implement payment refund functionality
4. Add request rate limiting
5. Set up monitoring and alerting