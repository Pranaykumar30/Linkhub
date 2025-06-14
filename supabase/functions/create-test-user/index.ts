
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TEST-USER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use the service role key to create users and bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const testUserEmail = "test-enterprise@linkhub.app";
    const testUserPassword = "TestUser123!";
    const testUserName = "Enterprise Test User";

    logStep("Checking if user already exists", { email: testUserEmail });

    // First check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(user => user.email === testUserEmail);

    let userId: string;

    if (existingUser) {
      logStep("User already exists, updating subscription", { userId: existingUser.id });
      userId = existingUser.id;
      
      // Update the existing user's subscription
      await updateSubscription(supabaseAdmin, userId, testUserEmail);
      
      return new Response(JSON.stringify({ 
        message: "Test user already exists and has been updated with Enterprise subscription",
        email: testUserEmail,
        password: testUserPassword,
        userId: userId,
        instructions: "You can now log in with these credentials to test all Enterprise features"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("Creating new test user", { email: testUserEmail });

      // Create the test user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testUserEmail,
        password: testUserPassword,
        email_confirm: true,
        user_metadata: {
          full_name: testUserName,
          username: "enterprise-test"
        }
      });

      if (authError) {
        logStep("Auth error", { error: authError.message });
        throw authError;
      }

      userId = authData.user.id;
      logStep("User created successfully", { userId });

      // Update subscription to Enterprise
      await updateSubscription(supabaseAdmin, userId, testUserEmail);

      logStep("Test user setup completed");

      return new Response(JSON.stringify({ 
        message: "Test user created successfully with Enterprise subscription",
        email: testUserEmail,
        password: testUserPassword,
        userId: userId,
        instructions: "You can now log in with these credentials to test all Enterprise features"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-test-user", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateSubscription(supabaseAdmin: any, userId: string, email: string) {
  logStep("Updating subscription to Enterprise", { userId });

  // Create/update profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      full_name: "Enterprise Test User",
      username: "enterprise-test",
      bio: "Test user for Enterprise subscription testing",
      custom_url: "enterprise-test"
    }, { onConflict: 'id' });

  if (profileError) {
    logStep("Profile error", { error: profileError.message });
  } else {
    logStep("Profile created/updated");
  }

  // Create/update subscription record with Enterprise privileges
  const subscriptionEnd = new Date();
  subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1); // 1 year from now

  const { error: subError } = await supabaseAdmin
    .from('subscribers')
    .upsert({
      user_id: userId,
      email: email,
      stripe_customer_id: `test_customer_${userId.slice(0, 8)}`,
      subscribed: true,
      subscription_tier: "Enterprise",
      subscription_end: subscriptionEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

  if (subError) {
    logStep("Subscription error", { error: subError.message });
    throw subError;
  }

  logStep("Subscription updated to Enterprise");
}
