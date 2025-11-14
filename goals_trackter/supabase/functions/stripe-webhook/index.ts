Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    const body = await req.text();
    let event;

    try {
      event = JSON.parse(body);
    } catch {
      throw new Error('Invalid JSON');
    }

    console.log('Webhook event type:', event.type);

    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const interval = session.metadata?.interval || 'monthly';

        if (!userId || !planId) {
          throw new Error('Missing metadata in checkout session');
        }

        // Update or create user subscription
        const subscriptionData = {
          user_id: userId,
          plan_id: parseInt(planId),
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          billing_interval: interval,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Check if subscription exists
        const checkResponse = await fetch(
          `${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            }
          }
        );

        const existing = await checkResponse.json();

        if (existing && existing.length > 0) {
          // Update existing
          await fetch(
            `${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${userId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriptionData),
            }
          );
        } else {
          // Insert new
          await fetch(
            `${supabaseUrl}/rest/v1/user_subscriptions`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriptionData),
            }
          );
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        await fetch(
          `${supabaseUrl}/rest/v1/user_subscriptions?stripe_subscription_id=eq.${subscription.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }),
          }
        );

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Get Free plan ID
        const planResponse = await fetch(
          `${supabaseUrl}/rest/v1/subscription_plans?name=eq.Free`,
          {
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            }
          }
        );

        const plans = await planResponse.json();
        const freePlanId = plans && plans.length > 0 ? plans[0].id : null;

        await fetch(
          `${supabaseUrl}/rest/v1/user_subscriptions?stripe_subscription_id=eq.${subscription.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'cancelled',
              plan_id: freePlanId,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        await fetch(
          `${supabaseUrl}/rest/v1/user_subscriptions?stripe_subscription_id=eq.${invoice.subscription}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            }),
          }
        );

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'WEBHOOK_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
