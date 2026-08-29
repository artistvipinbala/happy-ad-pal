import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Fetches daily USD→INR and EUR→INR rates.
// Caches per-date in the exchange_rates table so historical days stay fixed
// and repeated lookups don't hit the external API.
export const getExchangeRates = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ date: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { date } = data;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Cached rate for this date?
    const { data: cached } = await supabaseAdmin
      .from("exchange_rates")
      .select("usd_to_inr, eur_to_inr")
      .eq("date", date)
      .maybeSingle();
    if (cached) {
      return { usd_to_inr: Number(cached.usd_to_inr), eur_to_inr: Number(cached.eur_to_inr), source: "cache" };
    }

    // 2) Fetch from Frankfurter (ECB reference rates, supports historical dates)
    const today = new Date().toISOString().split("T")[0]!;
    const queryDate = date > today ? today : date;
    const url = `https://api.frankfurter.dev/v1/${queryDate}?base=INR&symbols=USD,EUR`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Exchange rate API failed (${res.status})`);
    const json = (await res.json()) as { rates?: { USD?: number; EUR?: number } };
    const usdPerInr = json.rates?.USD;
    const eurPerInr = json.rates?.EUR;
    if (!usdPerInr || !eurPerInr) throw new Error("Exchange rate API returned no INR rates");

    const usdToInr = Math.round((1 / usdPerInr) * 100) / 100;
    const eurToInr = Math.round((1 / eurPerInr) * 100) / 100;

    // 3) Cache it (only for past/today dates)
    await supabaseAdmin.from("exchange_rates").upsert(
      { date: queryDate, usd_to_inr: usdToInr, eur_to_inr: eurToInr },
      { onConflict: "date" },
    );

    return { usd_to_inr: usdToInr, eur_to_inr: eurToInr, source: "api" };
  });
