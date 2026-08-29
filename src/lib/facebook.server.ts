// Server-only Facebook Marketing API sync logic.
const FB_VERSION = "v21.0";

type Insight = Record<string, unknown>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function actionValue(row: Insight, keys: string[]): number {
  const actions = row["actions"];
  if (!Array.isArray(actions)) return 0;
  let total = 0;
  for (const a of actions as Array<Record<string, unknown>>) {
    if (keys.includes(String(a["action_type"]))) total += num(a["value"]);
  }
  return total;
}

function videoValue(row: Insight, field: string): number {
  const v = row[field];
  if (!Array.isArray(v)) return 0;
  return (v as Array<Record<string, unknown>>).reduce((s, x) => s + num(x["value"]), 0);
}

function conversionsOf(row: Insight): number {
  const purchases = actionValue(row, [
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
    "omni_purchase",
  ]);
  if (purchases > 0) return purchases;
  return actionValue(row, ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"]);
}

const BASE_FIELDS = [
  "spend",
  "impressions",
  "clicks",
  "ctr",
  "cpc",
  "reach",
  "frequency",
  "actions",
  "video_3_sec_watched_actions",
  "video_p50_watched_actions",
  "video_p95_watched_actions",
].join(",");

async function fetchInsights(params: {
  accountId: string;
  token: string;
  level: "account" | "campaign" | "adset" | "ad";
  since: string;
  until: string;
}): Promise<Insight[]> {
  const fields =
    params.level === "account"
      ? BASE_FIELDS
      : `${BASE_FIELDS},campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name`;

  let url =
    `https://graph.facebook.com/${FB_VERSION}/${params.accountId}/insights` +
    `?level=${params.level}` +
    `&time_increment=1` +
    `&limit=500` +
    `&time_range=${encodeURIComponent(JSON.stringify({ since: params.since, until: params.until }))}` +
    `&fields=${encodeURIComponent(fields)}` +
    `&access_token=${encodeURIComponent(params.token)}`;

  const out: Insight[] = [];
  for (let page = 0; page < 25 && url; page++) {
    const res = await fetch(url);
    const json = (await res.json()) as {
      data?: Insight[];
      paging?: { next?: string };
      error?: { message?: string };
    };
    if (!res.ok || json.error) {
      throw new Error(`Facebook API (${params.level}): ${json.error?.message ?? res.statusText}`);
    }
    out.push(...(json.data ?? []));
    url = json.paging?.next ?? "";
  }
  return out;
}

function mapMetrics(row: Insight) {
  const spend = num(row["spend"]);
  const conversions = conversionsOf(row);
  return {
    spend,
    impressions: Math.round(num(row["impressions"])),
    clicks: Math.round(num(row["clicks"])),
    ctr: num(row["ctr"]),
    cpc: num(row["cpc"]),
    reach: Math.round(num(row["reach"])),
    frequency: num(row["frequency"]),
    conversions: Math.round(conversions),
    cpr: conversions > 0 ? spend / conversions : 0,
    three_second_views: Math.round(videoValue(row, "video_3_sec_watched_actions")),
    fifty_percent_views: Math.round(videoValue(row, "video_p50_watched_actions")),
    ninety_five_percent_views: Math.round(videoValue(row, "video_p95_watched_actions")),
  };
}

export async function syncFacebookRange(since: string, until: string) {
  const token = process.env["FACEBOOK_ACCESS_TOKEN"];
  const rawAccount = process.env["FACEBOOK_AD_ACCOUNT_ID"];
  if (!token || !rawAccount) {
    throw new Error("Facebook credentials are not configured");
  }
  const accountId = rawAccount.startsWith("act_") ? rawAccount : `act_${rawAccount}`;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // ---- Account level (daily rows) ----
  const accountRows = await fetchInsights({ accountId, token, level: "account", since, until });

  const { data: existing } = await supabaseAdmin
    .from("ad_daily_data")
    .select("id, date, is_manual_override")
    .gte("date", since)
    .lte("date", until);

  const byDate = new Map((existing ?? []).map((r) => [r.date, r]));
  let synced = 0;

  for (const row of accountRows) {
    const date = String(row["date_start"] ?? "");
    if (!date) continue;
    const m = mapMetrics(row);
    const record = {
      date,
      ad_spend: m.spend,
      impressions: m.impressions,
      clicks: m.clicks,
      ctr: m.ctr,
      cpc: m.cpc,
      cpl: m.cpr,
      cpr: m.cpr,
      reach: m.reach,
      frequency: m.frequency,
      conversions: m.conversions,
      three_second_views: m.three_second_views,
      fifty_percent_views: m.fifty_percent_views,
      ninety_five_percent_views: m.ninety_five_percent_views,
    };

    const prev = byDate.get(date);
    if (prev?.is_manual_override) continue; // never overwrite manual edits
    if (prev) {
      await supabaseAdmin.from("ad_daily_data").update(record).eq("id", prev.id);
    } else {
      await supabaseAdmin.from("ad_daily_data").insert(record);
    }
    synced++;
  }

  // ---- Campaign / Ad set / Ad breakdown ----
  const levels = ["campaign", "adset", "ad"] as const;
  const breakdownRecords: Array<Record<string, unknown>> = [];

  for (const level of levels) {
    const rows = await fetchInsights({ accountId, token, level, since, until });
    for (const row of rows) {
      const date = String(row["date_start"] ?? "");
      if (!date) continue;
      const m = mapMetrics(row);
      breakdownRecords.push({
        date,
        level,
        campaign_id: (row["campaign_id"] as string) ?? null,
        campaign_name: (row["campaign_name"] as string) ?? null,
        adset_id: (row["adset_id"] as string) ?? null,
        adset_name: (row["adset_name"] as string) ?? null,
        ad_id: (row["ad_id"] as string) ?? null,
        ad_name: (row["ad_name"] as string) ?? null,
        ...m,
      });
    }
  }

  // Replace breakdown rows for the synced window (avoids duplicates)
  await supabaseAdmin.from("ad_breakdown").delete().gte("date", since).lte("date", until);
  for (let i = 0; i < breakdownRecords.length; i += 500) {
    const chunk = breakdownRecords.slice(i, i + 500);
    const { error } = await supabaseAdmin.from("ad_breakdown").insert(chunk as never);
    if (error) throw error;
  }

  return { synced, breakdown_synced: breakdownRecords.length, since, until };
}

export function dateRangeForDays(days: number) {
  const now = Date.now();
  const iso = (t: number) => new Date(t).toISOString().split("T")[0]!;
  return { since: iso(now - (days - 1) * 86_400_000), until: iso(now) };
}
