# Stripe Configuration Guide

## Current Status
The Goals Tracker app has a complete subscription system ready for Stripe integration.

## Required Stripe Keys
To enable real payment processing, configure these secrets in Supabase:

### 1. STRIPE_SECRET_KEY
- Get from: https://dashboard.stripe.com/apikeys
- Type: Secret key (starts with `sk_`)
- Used by: Edge functions for payment processing

### 2. STRIPE_PUBLISHABLE_KEY  
- Get from: https://dashboard.stripe.com/apikeys
- Type: Publishable key (starts with `pk_`)
- Optional for current implementation (not used in frontend)

## How to Configure

### Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard
2. Select your project (poadoavnqqtdkqnpszaw)
3. Navigate to Project Settings > Edge Functions > Secrets
4. Add secret: `STRIPE_SECRET_KEY` with your Stripe secret key
5. Edge functions will automatically use it via `Deno.env.get('STRIPE_SECRET_KEY')`

### Option 2: Via Supabase CLI
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

## Webhook Configuration
After setting keys, configure Stripe webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://poadoavnqqtdkqnpszaw.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## Testing Without Stripe Keys
The app works in development mode without Stripe keys:
- Shows "Stripe not configured" message
- Allows testing the UI flow
- No actual payments processed

## Testing With Stripe Test Keys
Use Stripe test mode keys for safe testing:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC

## Production Deployment
For production:
1. Use Stripe live keys (start with `sk_live_`)
2. Configure webhook with live endpoint
3. Test end-to-end payment flow
4. Monitor Stripe dashboard for transactions

## Current Edge Functions
All edge functions are deployed and ready:
- ✅ create-checkout - Creates Stripe checkout sessions
- ✅ stripe-webhook - Handles Stripe events
- ✅ customer-portal - Manages billing portal access

## Verification
Once keys are configured, test by:
1. Navigate to Profile > Subscription
2. Click "Upgrade to Pro"
3. Select billing interval
4. Complete checkout (use test card in test mode)
5. Verify subscription activates
6. Check Stripe dashboard for payment record
