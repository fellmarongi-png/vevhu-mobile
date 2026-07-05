import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkerStats {
  worker_id: string;
  worker_name: string;
  total: number;
  with_photos: number;
  with_audio: number;
  flagged: number;
  by_status: Record<string, number>;
  by_zone: Record<string, number>;
}

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get today's date range (UTC)
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const summaryDate = todayStart.toISOString().split("T")[0];

    // Query today's submissions with worker info
    const { data: submissions, error: queryError } = await adminClient
      .from("submissions")
      .select(`
        id,
        worker_id,
        status,
        photos,
        audio_recording_key,
        signature_key,
        flagged_reason,
        created_at,
        users!submissions_worker_id_fkey (
          full_name,
          zone_assigned
        )
      `)
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    if (queryError) {
      throw queryError;
    }

    // Group by worker and calculate stats
    const workerMap = new Map<string, WorkerStats>();

    for (const sub of submissions || []) {
      const workerId = sub.worker_id;
      const workerName = (sub as any).users?.full_name || workerId;
      const workerZone = (sub as any).users?.zone_assigned || "Unassigned";

      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          worker_id: workerId,
          worker_name: workerName,
          total: 0,
          with_photos: 0,
          with_audio: 0,
          flagged: 0,
          by_status: {},
          by_zone: {},
        });
      }

      const stats = workerMap.get(workerId)!;
      stats.total += 1;

      const photos = sub.photos;
      if (photos && (Array.isArray(photos) ? photos.length > 0 : Boolean(photos))) {
        stats.with_photos += 1;
      }

      if (sub.audio_recording_key) {
        stats.with_audio += 1;
      }

      if (sub.flagged_reason || sub.status === "flagged") {
        stats.flagged += 1;
      }

      if (sub.status) {
        stats.by_status[sub.status] = (stats.by_status[sub.status] || 0) + 1;
      }

      if (workerZone) {
        stats.by_zone[workerZone] = (stats.by_zone[workerZone] || 0) + 1;
      }
    }

    const workerStats = Array.from(workerMap.values());

    // Upsert into daily_summaries table (matching 001_initial.sql schema)
    const upsertRows = workerStats.map((stats) => ({
      date: summaryDate,
      worker_id: stats.worker_id,
      total_records: stats.total,
      records_with_photos: stats.with_photos,
      records_with_audio: stats.with_audio,
      records_flagged: stats.flagged,
      created_at: now.toISOString(),
    }));

    if (upsertRows.length > 0) {
      const { error: upsertError } = await adminClient
        .from("daily_summaries")
        .upsert(upsertRows, {
          onConflict: "date,worker_id",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        throw upsertError;
      }
    }

    // Prepare summary totals for WhatsApp message
    const overallTotal = workerStats.reduce((sum, w) => sum + w.total, 0);
    const overallFlagged = workerStats.reduce((sum, w) => sum + w.flagged, 0);
    const overallWithPhotos = workerStats.reduce((sum, w) => sum + w.with_photos, 0);
    const overallWithAudio = workerStats.reduce((sum, w) => sum + w.with_audio, 0);

    // Send WhatsApp message to managers via Meta Cloud API
    if (whatsappToken && whatsappPhoneId) {
      // Get manager phone numbers
      const { data: managers } = await adminClient
        .from("users")
        .select("phone, full_name")
        .in("role", ["manager", "admin"])
        .eq("is_active", true)
        .not("phone", "is", null);

      const workerLines = workerStats
        .map((w) => `  • ${w.worker_name}: ${w.total} submissions${w.flagged > 0 ? ` (${w.flagged} flagged)` : ""}`)
        .join("\n");

      const messageBody = `📊 *Daily Summary - ${summaryDate}*\n\n` +
        `Total Submissions: ${overallTotal}\n` +
        `With Photos: ${overallWithPhotos}\n` +
        `With Audio: ${overallWithAudio}\n` +
        `Flagged: ${overallFlagged}\n\n` +
        `*By Worker:*\n${workerLines || "  No submissions today"}`;

      const whatsappApiUrl = `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`;

      for (const manager of managers || []) {
        if (!manager.phone) continue;

        // Normalize phone number (remove non-digits, ensure country code)
        const phone = manager.phone.replace(/\D/g, "");

        try {
          const waResponse = await fetch(whatsappApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${whatsappToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: phone,
              type: "text",
              text: {
                preview_url: false,
                body: messageBody,
              },
            }),
          });

          if (!waResponse.ok) {
            const errBody = await waResponse.text();
            console.error(`WhatsApp send failed for ${manager.full_name}:`, errBody);
          } else {
            console.log(`WhatsApp message sent to ${manager.full_name} (${phone})`);
          }
        } catch (waError) {
          console.error(`WhatsApp error for ${manager.full_name}:`, waError);
        }
      }
    } else {
      console.warn("WhatsApp credentials not configured — skipping notifications");
    }

    const summary = {
      date: summaryDate,
      generated_at: now.toISOString(),
      totals: {
        submissions: overallTotal,
        with_photos: overallWithPhotos,
        with_audio: overallWithAudio,
        flagged: overallFlagged,
        workers_active: workerStats.length,
      },
      by_worker: workerStats,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("daily-summary error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
