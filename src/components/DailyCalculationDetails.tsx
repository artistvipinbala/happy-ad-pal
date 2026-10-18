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

function Step({ title, lines, result }: { title: string; lines: string[]; result?: string }) {
  return (
    <section className="border-b border-border py-4 last:border-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        {lines.map((line, index) => <p key={index} className="break-words leading-relaxed">{line}</p>)}
      </div>
      {result && <p className="mt-2 break-words font-semibold text-foreground tabular-nums">{result}</p>}
    </section>
  );
}

export function DailyCalculationDetails({ date, metrics: m, hasSales, usdRate, eurRate, liveUsd, liveEur, expenses, adMetrics: ad }: Props) {
  const money = formatINR;
  const rate = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 6 });
  const fxLine = (currency: string, qty: number, fx: number, live: boolean, amount: number) =>
    live
      ? `${qty} × ${currency}7 × ₹${rate(fx)} = ${money(amount)} (today's latest rate)`
      : `Saved INR amount: ${money(amount)} · ${qty} sales · saved rate: ${fx > 0 ? `₹${rate(fx)}/${currency}` : "not recorded"}. Historical total is used as saved, not recalculated with today's rate.`;

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
          <TooltipContent>View calculations</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border p-5 pr-12 text-left">
          <DialogTitle className="tracking-normal">Daily calculations · {date}</DialogTitle>
          <DialogDescription>Revenue, deductions and profit · amounts in INR</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 pb-3">
          {!hasSales && <p className="mt-4 text-sm text-warning">No saved sales entry for this day. Sales, commission and collected GST are zero.</p>}
          <Step title="1. Successful sales & domestic revenue" lines={[
            `Source: saved sales entry for ${date}. Price per domestic sale (GST included): ${money(m.amountPerSale)}${hasSales ? " (recorded sale price)" : " (product setting fallback)"}.`,
            `Domestic platform = total − GPay − USD − EUR = ${m.qty} − ${m.gpay} − ${m.usdQty} − ${m.eurQty} = ${m.platformQty}`,
            `Domestic platform revenue = ${m.platformQty} × ${money(m.amountPerSale)} = ${money(m.platformQty * m.amountPerSale)}`,
            `Direct GPay revenue = ${m.gpay} × ${money(m.amountPerSale)} = ${money(m.gpay * m.amountPerSale)}`,
          ]} result={`Domestic revenue = ${money(m.inrRevenue)}`} />
          <Step title="2. International revenue & exchange rates" lines={[
            `USD: ${fxLine("$", m.usdQty, usdRate, liveUsd, m.usdAmountInr)}`,
            `EUR: ${fxLine("€", m.eurQty, eurRate, liveEur, m.eurAmountInr)}`,
          ]} />
          <Step title="3. Total revenue" lines={[
            `Domestic + USD + EUR = ${money(m.inrRevenue)} + ${money(m.usdAmountInr)} + ${money(m.eurAmountInr)}`,
          ]} result={`Revenue = ${money(m.totalRevenue)}`} />
          <Step title="4. Payment commission" lines={[
            `Domestic platform: ${Math.max(0, m.platformQty)} × ${money(m.amountPerSale)} × ${rate(domesticRateForDate(date) * 100)}% = ${money(m.domesticCommission)}`,
            `International: (${money(m.usdAmountInr)} + ${money(m.eurAmountInr)}) × ${rate(INTERNATIONAL_RATE * 100)}% = ${money(m.internationalCommission)}`,
            `Direct GPay: ${money(m.gpay * m.amountPerSale)} × 0% = ${money(0)}`,
          ]} result={`Total commission = ${money(m.domesticCommission)} + ${money(m.internationalCommission)} = ${money(m.totalCommission)}`} />
          <Step title="5. Advertising cost including GST" lines={[
            `Source: day's saved account ad spend (Facebook sync or manual entry) = ${money(m.rawSpend)}`,
            `Ad GST = ${money(m.rawSpend)} × 18% = ${money(m.adGst)}`,
          ]} result={`Ad spend including GST = ${money(m.rawSpend)} + ${money(m.adGst)} = ${money(m.spend)}`} />
          <Step title="6. Other expenses" lines={expenses.length
            ? expenses.map((expense) => `${expense.description || "Expense"}: ${money(expense.amount)}`)
            : ["No expense entries saved for this date."]
          } result={`Sum of ${expenses.length} expense entries = ${money(m.expenses)}`} />
          <Step title="7. Net GST payable" lines={[
            `GST collected: ${money(m.gst)} (recorded on the sales entry, not recalculated from current product settings).`,
            `Collected GST − ad GST credit = ${money(m.gst)} − ${money(m.adGst)}`,
            ...(m.gstPayable < 0 ? ["Negative net GST is retained as a credit in this calculation; it is not capped at zero."] : []),
          ]} result={`Net GST payable = ${money(m.gstPayable)}`} />
          <Step title="8. Net profit" lines={[
            "Revenue − commission − ad spend including GST − other expenses − net GST payable",
            `${money(m.totalRevenue)} − ${money(m.totalCommission)} − ${money(m.spend)} − ${money(m.expenses)} − (${money(m.gstPayable)})`,
          ]} result={`Net profit = ${money(m.profit)}`} />
          <Step title="9. Customer acquisition cost (CAC)" lines={[
            m.qty > 0 ? `Ad spend including GST ÷ total successful sales = ${money(m.spend)} ÷ ${m.qty}` : "No successful sales: CAC calculation returns zero; the daily card shows —.",
          ]} result={`CAC = ${money(m.cac)}`} />
          <Step title="10. Recorded ad metrics" lines={[
            "Source: saved account ad metrics (Facebook sync or manual entry). These values are displayed directly, not recalculated by this page.",
            `Impressions: ${ad.impressions} · Clicks: ${ad.clicks} · Reach: ${ad.reach}`,
            `CTR: ${rate(ad.ctr)}% · CPC: ${money(ad.cpc)} · Frequency: ${rate(ad.frequency)}`,
          ]} />
          <p className="py-3 text-xs text-muted-foreground">Amounts are displayed to two decimals; calculations use unrounded values.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}