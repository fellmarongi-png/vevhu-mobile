import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify auth from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user role is manager or admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["manager", "admin"].includes(userData.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions. Manager or admin role required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const worker = url.searchParams.get("worker");
    const zone = url.searchParams.get("zone");
    const status = url.searchParams.get("status");

    // Build query with filters, join users for worker name & zone
    let query = adminClient
      .from("submissions")
      .select(`
        id,
        created_at,
        updated_at,
        worker_id,
        status,
        field_notes,
        photos,
        audio_recording_key,
        extra_fields,
        flagged_reason,
        gps_latitude,
        gps_longitude,
        stand_number_official,
        stand_number_physical,
        respondent_name,
        respondent_phone,
        users!submissions_worker_id_fkey (
          full_name,
          role,
          zone_assigned
        )
      `)
      .order("created_at", { ascending: false });

    if (from) {
      query = query.gte("created_at", from);
    }
    if (to) {
      // Include the entire "to" day
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      query = query.lt("created_at", toDate.toISOString());
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (zone) {
      // Filter by worker zone_assigned via join
      const { data: zoneWorkers } = await adminClient
        .from("users")
        .select("id")
        .eq("zone_assigned", zone);
      if (zoneWorkers && zoneWorkers.length > 0) {
        query = query.in("worker_id", zoneWorkers.map((w) => w.id));
      }
    }
    if (worker) {
      // Filter by worker name via join
      const { data: workerData } = await adminClient
        .from("users")
        .select("id")
        .ilike("full_name", `%${worker}%`);
      if (workerData && workerData.length > 0) {
        const workerIds = workerData.map((w) => w.id);
        query = query.in("worker_id", workerIds);
      }
    }

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Map submissions to Excel rows
    const rows = (submissions || []).map((sub: any) => {
      const workerName = sub.users?.full_name || sub.worker_id;
      const workerZone = sub.users?.zone_assigned || "";
      const extraFields = sub.extra_fields || {};
      const isFlagged = Boolean(sub.flagged_reason || sub.status === "flagged");

      return {
        "ID": sub.id,
        "Created At": sub.created_at ? new Date(sub.created_at).toLocaleString() : "",
        "Updated At": sub.updated_at ? new Date(sub.updated_at).toLocaleString() : "",
        "Worker": workerName,
        "Zone": workerZone,
        "Status": sub.status || "",
        "Official Stand": sub.stand_number_official || "",
        "Physical Stand": sub.stand_number_physical || "",
        "Respondent": sub.respondent_name || "",
        "Field Notes": sub.field_notes || "",
        "Photos": Array.isArray(sub.photos) ? sub.photos.join(", ") : (sub.photos || ""),
        "Audio Key": sub.audio_recording_key || "",
        "Flagged": isFlagged ? "Yes" : "No",
        "Flagged Reason": sub.flagged_reason || "",
        "Latitude": sub.gps_latitude || "",
        "Longitude": sub.gps_longitude || "",
        // Spread extra_fields as individual columns
        ...Object.fromEntries(
          Object.entries(extraFields).map(([k, v]) => [
            `Extra: ${k}`,
            typeof v === "object" ? JSON.stringify(v) : String(v ?? ""),
          ])
        ),
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);

    // Auto-size columns based on content
    const colWidths = rows.reduce((acc: Record<string, number>, row: any) => {
      Object.entries(row).forEach(([key, val]) => {
        const len = Math.max(key.length, String(val ?? "").length);
        acc[key] = Math.max(acc[key] || 10, Math.min(len, 50));
      });
      return acc;
    }, {});

    ws["!cols"] = Object.values(colWidths).map((w) => ({ wch: w as number }));

    XLSX.utils.book_append_sheet(wb, ws, "Submissions");

    // Generate the xlsx buffer
    const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `submissions_${dateStr}.xlsx`;

    return new Response(xlsxBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": xlsxBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("generate-excel error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
