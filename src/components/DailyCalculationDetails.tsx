import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatINR } from "@/lib/format";
import { domesticRateForDate, INTERNATIONAL_RATE } from "@/lib/payment-fees";

type DailyAuditMetrics = {
  qty: number; gpay: number; usdQty: number; eurQty: number; platformQty: number;
  amountPerSale: number; inrRevenue: number; usdAmountInr: number; eurAmountInr: number;
  totalRevenue: number; domesticCommission: number; internationalCommission: number;
  totalCommission: number; rawSpend: number; adGst: number; spend: number;
  expenses: number; gst: number; gstPayable: number; profit: number; cac: number;
};

type Props = {
  date: string;
  metrics: DailyAuditMetrics;
  hasSales: boolean;
  usdRate: number;
  eurRate: number;
  liveUsd: boolean;
  liveEur: boolean;
  expenses: { id: string; amount: number; description: string | null }[];
  adMetrics: { impressions: number; clicks: number; ctr: number; cpc: number; reach: number; frequency: number };
};

function Step({ title, lines, result }: { title: string; lines: string[]; result?: string | undefined }) {
  return (
    <section className="border-b border-border py-3 last:border-0">
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        {lines.map((line, index) => <p key={index} className="break-words leading-relaxed">{line}</p>)}
      </div>
      {result && <p className="mt-1.5 break-words font-semibold text-foreground tabular-nums">{result}</p>}
    </section>
  );
}

export function DailyCalculationDetails({ date, metrics: m, hasSales, usdRate, eurRate, liveUsd, liveEur, expenses, adMetrics: ad }: Props) {
  const money = formatINR;
  const rate = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 6 });
  const domesticPct = rate(domesticRateForDate(date) * 100);
  const internationalPct = rate(INTERNATIONAL_RATE * 100);
  const fxLine = (currency: string, qty: number, fx: number, live: boolean, amount: number) =>
    live
      ? `${qty} × ${currency}7 = ${currency}${qty * 7}. ഇന്നത്തെ rate ${currency}1 = ₹${rate(fx)} → ${money(amount)}`
      : `സൂക്ഷിച്ച തുക ${money(amount)}. പഴയ rate ${currency}1 = ${fx > 0 ? `₹${rate(fx)}` : "ഇല്ല"} — മാറ്റുന്നില്ല`;

  return (
    <Dialog>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`View calculations for ${date}`}>
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>കണക്കുകൾ കാണാം</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border p-5 pr-12 text-left">
          <DialogTitle className="tracking-normal">ഈ ദിവസത്തെ കണക്ക് · {date}</DialogTitle>
          <DialogDescription>എത്ര കിട്ടി, എത്ര ചെലവായി, എത്ര ബാക്കി?</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 pb-3">
          {!hasSales && <p className="mt-3 text-sm text-warning">വिल्प്പന ചേർത്തിട്ടില്ല — revenue, commission, GST = 0.</p>}
          <Step title="1. രൂപയിൽ എത്ര കിട്ടി?" lines={[
            `${m.qty} പേർ വാങ്ങി: GPay ${m.gpay}, ഡോളർ ${m.usdQty}, യൂറോ ${m.eurQty}, platform ${m.platformQty}.`,
            `ഒരാളുടെ വില ${money(m.amountPerSale)}${hasSales ? "" : " (settings-ലെ വില)"}.`,
            `Platform: ${m.platformQty} × ${money(m.amountPerSale)} = ${money(m.platformQty * m.amountPerSale)}`,
            `GPay: ${m.gpay} × ${money(m.amountPerSale)} = ${money(m.gpay * m.amountPerSale)}`,
          ]} result={`കൂടി = ${money(m.inrRevenue)}`} />
          <Step title="2. ഡോളർ/യൂറോ രൂപയാക്കിയാൽ" lines={[
            fxLine("$", m.usdQty, usdRate, liveUsd, m.usdAmountInr),
            fxLine("€", m.eurQty, eurRate, liveEur, m.eurAmountInr),
          ]} />
          <Step title="3. ആകെ കിട്ടിയ പണം" lines={[
            `${money(m.inrRevenue)} + ${money(m.usdAmountInr)} + ${money(m.eurAmountInr)} = ${money(m.totalRevenue)}`,
          ]} result={`ആകെ = ${money(m.totalRevenue)}`} />
          <Step title="4. പണത്തിനുള്ള ഫീസ് (commission)" lines={[
            `Platform: ${money(m.platformQty * m.amountPerSale)} × ${domesticPct}% = ${money(m.domesticCommission)}`,
            `USD+EUR: ${money(m.usdAmountInr + m.eurAmountInr)} × ${internationalPct}% = ${money(m.internationalCommission)}`,
            `GPay-യ്ക്ക് ഫീസ് ഇല്ല: ₹0`,
          ]} result={`ആകെ ഫീസ് = ${money(m.totalCommission)}`} />
          <Step title="5. പരസ്യച്ചെലവ്" lines={[
            `പരസ്യം = ${money(m.rawSpend)}. അതിന്റെ GST 18% = ${money(m.adGst)}`,
          ]} result={`കൂടി = ${money(m.spend)}`} />
          <Step title="6. മറ്റ് ചെലവുകൾ" lines={expenses.length
            ? expenses.map((expense) => `${expense.description || "മറ്റൊരു ചെലവ്"}: ${money(expense.amount)}`)
            : ["മറ്റ് ചെലവുകളൊന്നുമില്ല."]
          } result={`ആകെ = ${money(m.expenses)}`} />
          <Step title="7. GST എത്ര ബാക്കി?" lines={[
            `വിൽപ്പനയിൽ കിട്ടിയ GST ${money(m.gst)} − പരസ്യ GST ${money(m.adGst)} = ${money(m.gstPayable)}`,
            ...(m.gstPayable < 0 ? [`മൈനസ് ആയതുകൊണ്ട് ലാഭത്തിൽ ${money(Math.abs(m.gstPayable))} കൂട്ടും.`] : []),
          ]} result={`ബാക്കി GST = ${money(m.gstPayable)}`} />
          <Step title="8. എത്ര ബാക്കി? (profit)" lines={[
            `${money(m.totalRevenue)} − ഫീസ് ${money(m.totalCommission)} = ${money(m.totalRevenue - m.totalCommission)}`,
            `− പരസ്യം ${money(m.spend)} = ${money(m.totalRevenue - m.totalCommission - m.spend)}`,
            `− മറ്റ് ചെലവ് ${money(m.expenses)} = ${money(m.totalRevenue - m.totalCommission - m.spend - m.expenses)}`,
            m.gstPayable < 0
              ? `+ GST മൈനസ് ${money(Math.abs(m.gstPayable))} = ${money(m.profit)}`
              : `− GST ${money(m.gstPayable)} = ${money(m.profit)}`,
          ]} result={m.profit >= 0 ? `ലാഭം = ${money(m.profit)}` : `നഷ്ടം = ${money(Math.abs(m.profit))}`} />
          <Step title="9. ഒരാളെ വാങ്ങിപ്പിക്കാൻ ചെലവ് (CAC)" lines={[
            ...(m.qty > 0 ? [`${money(m.spend)} ÷ ${m.qty} പേർ`] : ["ആരും വാങ്ങിയില്ല — ഇപ്പോൾ പറയാനാവില്ല."]),
          ]} result={m.qty > 0 ? `CAC = ${money(m.cac)}` : undefined} />
          <Step title="10. പരസ്യത്തിന്റെ വിവരങ്ങൾ" lines={[
            "Facebook-ൽ നിന്നുള്ളത് — പുതിയ കണക്കില്ല.",
            `Impressions ${ad.impressions} · Clicks ${ad.clicks} · Reach ${ad.reach}`,
            `CTR ${rate(ad.ctr)}% · CPC ${money(ad.cpc)} · Frequency ${rate(ad.frequency)}`,
          ]} />
          <p className="py-2 text-xs text-muted-foreground">കൂട്ടുമ്പോൾ ചെറിയ പൈസ വ്യത്യാസം തോന്നാം.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
