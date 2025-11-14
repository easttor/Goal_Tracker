Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { planId, interval } = await req.json();

    if (!planId || !interval) {
      throw new Error('Plan ID and interval are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
      throw new Error('Missing environment variables');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': serviceRoleKey
      }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid token');
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    const userEmail = userData.email;

    // Get subscription plan details
    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscription_plans?id=eq.${planId}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        }
      }
    );

    const plans = await planResponse.json();
    if (!plans || plans.length === 0) {
      throw new Error('Plan not found');
    }

    const plan = plans[0];

    // For now, create a success URL without actual Stripe integration
    // When Stripe keys are configured, this will create actual checkout sessions
    const isStripeConfigured = stripeSecretKey && stripeSecretKey !== 'your_stripe_secret_key_here';

    if (!isStripeConfigured) {
      // Return mock success for development
      const successUrl = `${req.headers.get('origin') || 'http://localhost:5173'}?subscription=success&plan=${plan.name}&interval=${interval}`;
      
      return new Response(JSON.stringify({
        data: {
          checkoutUrl: successUrl,
          message: 'Stripe not configured. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to proceed with real payments.'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId;
    
    // Check existing subscription
    const subResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        }
      }
    );

    const subscriptions = await subResponse.json();
    
    if (subscriptions && subscriptions.length > 0 && subscriptions[0].stripe_customer_id) {
      stripeCustomerId = subscriptions[0].stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: userEmail,
          metadata: JSON.stringify({ user_id: userId }),
        }),
      });

      const customer = await customerResponse.json();
      stripeCustomerId = customer.id;
    }

    // Determine price based on interval
    const priceAmount = interval === 'yearly' ? plan.price_yearly * 100 : plan.price_monthly * 100;

    // Create Stripe Price (or use existing price IDs if set)
    let stripePriceId;
    
    if (interval === 'yearly' && plan.stripe_price_yearly_id) {
      stripePriceId = plan.stripe_price_yearly_id;
    } else if (interval === 'monthly' && plan.stripe_price_monthly_id) {
      stripePriceId = plan.stripe_price_monthly_id;
    } else {
      // Create new price
      const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          product_data: JSON.stringify({
            name: `${plan.name} Plan - ${interval}`,
          }),
          unit_amount: Math.round(priceAmount).toString(),
          currency: 'usd',
          recurring: JSON.stringify({ interval: interval === 'yearly' ? 'year' : 'month' }),
        }),
      });

      const price = await priceResponse.json();
      stripePriceId = price.id;

      // Update plan with price ID
      await fetch(`${supabaseUrl}/rest/v1/subscription_plans?id=eq.${planId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [interval === 'yearly' ? 'stripe_price_yearly_id' : 'stripe_price_monthly_id']: stripePriceId,
        }),
      });
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        line_items: JSON.stringify([{
          price: stripePriceId,
          quantity: 1,
        }]),
        mode: 'subscription',
        success_url: `${origin}?subscription=success`,
        cancel_url: `${origin}?subscription=cancelled`,
        metadata: JSON.stringify({
          user_id: userId,
          plan_id: planId.toString(),
          interval: interval,
        }),
      }),
    });

    const session = await sessionResponse.json();

    return new Response(JSON.stringify({
      data: {
        checkoutUrl: session.url,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'CHECKOUT_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
