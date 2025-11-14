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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
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

    // Check if Stripe is configured
    const isStripeConfigured = stripeSecretKey && stripeSecretKey !== 'your_stripe_secret_key_here';

    if (!isStripeConfigured) {
      return new Response(JSON.stringify({
        data: {
          portalUrl: null,
          message: 'Stripe not configured. Add STRIPE_SECRET_KEY to enable billing portal.'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's subscription to find Stripe customer ID
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
    
    if (!subscriptions || subscriptions.length === 0 || !subscriptions[0].stripe_customer_id) {
      throw new Error('No Stripe customer found for this user');
    }

    const stripeCustomerId = subscriptions[0].stripe_customer_id;

    // Create Stripe billing portal session
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        return_url: origin,
      }),
    });

    const portal = await portalResponse.json();

    return new Response(JSON.stringify({
      data: {
        portalUrl: portal.url,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Portal creation error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'PORTAL_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
