import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const syncFacebookAds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number }) => ({
    days: Math.min(Math.max(Number(input?.days ?? 30), 1), 90),
  }))
  .handler(async ({ data }) => {
    const { syncFacebookRange, dateRangeForDays } = await import("./facebook.server");
    const { since, until } = dateRangeForDays(data.days);
    return syncFacebookRange(since, until);
  });
