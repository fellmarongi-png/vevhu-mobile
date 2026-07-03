import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Seed handler to ensure test workers exist in DB
    if (body.action === "seed") {
      const defaultPinHash = bcrypt.hashSync("1234", 10);
      const seedWorkers = [
        {
          id: "a0000000-0000-0000-0000-000000000001",
          full_name: "John Doe",
          role: "worker",
          pin_hash: defaultPinHash,
          is_active: true,
          email: "john.doe@vevhu.local",
          zone_assigned: "Harare North",
          daily_target: 10,
        },
        {
          id: "a0000000-0000-0000-0000-000000000002",
          full_name: "Tendai Moyo",
          role: "worker",
          pin_hash: defaultPinHash,
          is_active: true,
          email: "tendai.moyo@vevhu.local",
          zone_assigned: "Harare South",
          daily_target: 15,
        },
      ];

      const { data: inserted, error: seedError } = await adminClient
        .from("users")
        .upsert(seedWorkers, { onConflict: "id" })
        .select("id, full_name, role");

      if (seedError) {
        return new Response(JSON.stringify({ error: seedError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message: "Seed successful", workers: inserted }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, pin } = body;

    if (!name || !pin) {
      return new Response(JSON.stringify({ error: "name and pin are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-seed on first login attempt if database has no workers
    const { count } = await adminClient.from("users").select("*", { count: "exact", head: true });
    if (count === 0) {
      const defaultPinHash = bcrypt.hashSync("1234", 10);
      await adminClient.from("users").upsert([
        {
          id: "a0000000-0000-0000-0000-000000000001",
          full_name: "John Doe",
          role: "worker",
          pin_hash: defaultPinHash,
          is_active: true,
          email: "john.doe@vevhu.local",
          zone_assigned: "Harare North",
          daily_target: 10,
        },
        {
          id: "a0000000-0000-0000-0000-000000000002",
          full_name: "Tendai Moyo",
          role: "worker",
          pin_hash: defaultPinHash,
          is_active: true,
          email: "tendai.moyo@vevhu.local",
          zone_assigned: "Harare South",
          daily_target: 15,
        },
      ]);
    }

    // Look up worker by full_name
    const { data: worker, error: queryError } = await adminClient
      .from("users")
      .select("id, full_name, role, pin_hash, is_active, email, auth_user_id, failed_login_attempts, locked_until")
      .eq("full_name", name)
      .single();

    if (queryError || !worker) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!worker.is_active) {
      return new Response(JSON.stringify({ error: "Worker account is inactive" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check brute-force lockout
    if (worker.locked_until && new Date(worker.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(worker.locked_until).getTime() - Date.now()) / 60000);
      return new Response(
        JSON.stringify({ error: `Account locked. Try again in ${minutesLeft} minute(s).` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify PIN using pure JS bcryptjs
    const pinValid = bcrypt.compareSync(pin.toString(), worker.pin_hash);

    if (!pinValid) {
      const newAttempts = (worker.failed_login_attempts || 0) + 1;
      const updateData: Record<string, unknown> = { failed_login_attempts: newAttempts };
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
      }
      await adminClient.from("users").update(updateData).eq("id", worker.id);
      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
      const msg = remaining > 0 ? `Invalid PIN. ${remaining} attempt(s) remaining.` : "Account locked due to too many failed attempts.";
      return new Response(JSON.stringify({ error: msg }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset failed attempts on successful login
    await adminClient.from("users").update({ failed_login_attempts: 0, locked_until: null }).eq("id", worker.id);

    const workerEmail = worker.email || `worker-${worker.id}@internal.vevhu.local`;
    let authUserId: string;

    if (worker.auth_user_id) {
      authUserId = worker.auth_user_id;
    } else {
      // First-time: create auth user and store the ID
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: workerEmail,
        email_confirm: true,
        app_metadata: {
          full_name: worker.full_name,
          role: worker.role,
          worker_id: worker.id,
        },
      });

      if (createError) {
        // Fallback: search Auth users by email if already exists
        const { data: usersList } = await adminClient.auth.admin.listUsers();
        const found = usersList?.users?.find((u) => u.email === workerEmail);
        if (!found) throw createError;
        authUserId = found.id;
      } else {
        authUserId = newUser.user!.id;
      }

      await adminClient.from("users").update({ auth_user_id: authUserId }).eq("id", worker.id);
    }

    // ALWAYS update app_metadata on every login so claims are fresh
    await adminClient.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        full_name: worker.full_name,
        role: worker.role,
        worker_id: worker.id,
      },
    });

    // Generate magiclink OTP
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: workerEmail,
    });

    if (linkError || !linkData?.properties?.email_otp) {
      throw linkError || new Error("Failed to generate authentication token");
    }

    // Exchange OTP for real JWT session (access_token & refresh_token)
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: sessionData, error: sessionError } = await userClient.auth.verifyOtp({
      email: workerEmail,
      token: linkData.properties.email_otp,
      type: "magiclink",
    });

    if (sessionError || !sessionData?.session) {
      throw sessionError || new Error("Failed to issue session token");
    }

    const { access_token, refresh_token, expires_at } = sessionData.session;

    return new Response(
      JSON.stringify({
        user: {
          id: worker.id,
          name: worker.full_name,
          role: worker.role,
        },
        token: access_token,
        refresh_token: refresh_token,
        expires_at: expires_at ? new Date(expires_at * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("worker-auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
