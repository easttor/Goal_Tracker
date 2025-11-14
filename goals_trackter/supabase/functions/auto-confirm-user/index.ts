// Auto-confirm new users upon signup
// This edge function is triggered after a user signs up

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get the service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing environment variables');
    }

    // Get user_id from request body
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    // Auto-confirm the user's email
    const confirmResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        email_confirm: true
      })
    });

    if (!confirmResponse.ok) {
      const error = await confirmResponse.text();
      throw new Error(`Failed to confirm user: ${error}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User email confirmed successfully',
        user_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'AUTO_CONFIRM_ERROR',
          message: error.message 
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
