import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ days: z.number().int().min(1).max(90).default(1) });

export const Route = createFileRoute("/api/public/cron/facebook-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-cron-token") ?? "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: config } = await supabaseAdmin
          .from("app_cron_config")
          .select("token")
          .limit(1)
          .maybeSingle();

        if (!config?.token || token.length !== config.token.length || token !== config.token) {
          return new Response("Unauthorized", { status: 401 });
        }

        let days = 1;
        try {
          days = bodySchema.parse(await request.json()).days;
        } catch {
          days = 1;
        }

        try {
          const { syncFacebookRange, dateRangeForDays } = await import("@/lib/facebook.server");
          const { since, until } = dateRangeForDays(days);
          const result = await syncFacebookRange(since, until);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          console.error("[cron/facebook-sync]", e);
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "sync failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
