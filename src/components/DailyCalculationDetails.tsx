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
      ? `${qty} പേർ × ${currency}7 = ${currency}${qty * 7}. ഒരു ${currency} = ₹${rate(fx)}. അതുകൊണ്ട് ${currency}${qty * 7} × ₹${rate(fx)} = ${money(amount)}. ഇന്നത്തെ rate ആണ് ഉപയോഗിച്ചത്.`
      : `${qty} പേരിൽ നിന്ന് കിട്ടിയ പണത്തിന്റെ അന്ന് സൂക്ഷിച്ച രൂപയിലെ തുക: ${money(amount)}. അന്നത്തെ rate: ${fx > 0 ? `ഒരു ${currency} = ₹${rate(fx)}` : "രേഖപ്പെടുത്തിയിട്ടില്ല"}. ഇന്നത്തെ rate കൊണ്ട് ഈ പഴയ തുക മാറ്റുന്നില്ല.`;

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
          <TooltipContent>കണക്കുകൾ നോക്കാം</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border p-5 pr-12 text-left">
          <DialogTitle className="tracking-normal">ഈ ദിവസത്തെ കണക്ക് · {date}</DialogTitle>
          <DialogDescription>എത്ര പണം കിട്ടി? എത്ര ചെലവായി? എത്ര ബാക്കിയുണ്ട്?</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 pb-3">
          {!hasSales && <p className="mt-4 text-sm text-warning">ഈ ദിവസത്തെ വിൽപ്പന ചേർത്തിട്ടില്ല. അതുകൊണ്ട് വിൽപ്പനയും commission-ഉം വാങ്ങിയ GST-യും 0 ആണ്.</p>}
          <Step title="1. രൂപയിൽ എത്ര പണം കിട്ടി?" lines={[
            `ആകെ ${m.qty} പേർ വാങ്ങി. അതിൽ GPay വഴി ${m.gpay} പേർ, ഡോളറിൽ ${m.usdQty} പേർ, യൂറോയിൽ ${m.eurQty} പേർ.`,
            `ബാക്കി ${m.platformQty} പേർ platform വഴി രൂപയിൽ പണം നൽകി: ${m.qty} − ${m.gpay} − ${m.usdQty} − ${m.eurQty} = ${m.platformQty}.`,
            `ഒരാൾ നൽകിയ വില = ${money(m.amountPerSale)} (GST ഉൾപ്പെടെ). ${hasSales ? "അന്ന് സൂക്ഷിച്ച വിലയാണ് ഇത്." : "വിൽപ്പന ഇല്ലാത്തതിനാൽ settings-ലെ വിലയാണ് കാണിക്കുന്നത്."}`,
            `Platform വഴി കിട്ടിയത്: ${m.platformQty} പേർ × ${money(m.amountPerSale)} = ${money(m.platformQty * m.amountPerSale)}.`,
            `GPay വഴി കിട്ടിയത്: ${m.gpay} പേർ × ${money(m.amountPerSale)} = ${money(m.gpay * m.amountPerSale)}.`,
          ]} result={`രണ്ടും കൂട്ടിയാൽ = ${money(m.inrRevenue)}`} />
          <Step title="2. ഡോളറും യൂറോയും രൂപയാക്കിയാൽ?" lines={[
            `ഡോളർ (USD): ${fxLine("$", m.usdQty, usdRate, liveUsd, m.usdAmountInr)}`,
            `യൂറോ (EUR): ${fxLine("€", m.eurQty, eurRate, liveEur, m.eurAmountInr)}`,
          ]} />
          <Step title="3. ആകെ കിട്ടിയ പണം (Revenue)" lines={[
            "രൂപയിൽ കിട്ടിയതും, ഡോളറും യൂറോയും രൂപയാക്കിയതും കൂട്ടാം.",
            `${money(m.inrRevenue)} + ${money(m.usdAmountInr)} + ${money(m.eurAmountInr)} = ${money(m.totalRevenue)}`,
          ]} result={`ആകെ കിട്ടിയത് = ${money(m.totalRevenue)}`} />
          <Step title="4. പണം സ്വീകരിക്കാൻ കൊടുക്കുന്ന ഫീസ് (Commission)" lines={[
            `രൂപയിൽ platform വഴി കിട്ടുന്ന ഓരോ ₹100-നും ₹${rate(domesticRateForDate(date) * 100)} ഫീസ്. അതാണ് ${rate(domesticRateForDate(date) * 100)}%.`,
            `${Math.max(0, m.platformQty)} പേർ × ${money(m.amountPerSale)} × ${rate(domesticRateForDate(date) * 100)} ÷ 100 = ${money(m.domesticCommission)}.`,
            `ഡോളറും യൂറോയും വഴി കിട്ടുന്ന ഓരോ ₹100-നും ₹${rate(INTERNATIONAL_RATE * 100)} ഫീസ്.`,
            `(${money(m.usdAmountInr)} + ${money(m.eurAmountInr)}) × ${rate(INTERNATIONAL_RATE * 100)} ÷ 100 = ${money(m.internationalCommission)}.`,
            "നേരിട്ട് GPay വഴി കിട്ടിയ പണത്തിന് ഫീസ് ഇല്ല: ₹0.",
          ]} result={`ആകെ ഫീസ് = ${money(m.domesticCommission)} + ${money(m.internationalCommission)} = ${money(m.totalCommission)}`} />
          <Step title="5. പരസ്യത്തിന് എത്ര ചെലവായി?" lines={[
            `ഈ ദിവസത്തെ പരസ്യച്ചെലവായി രേഖപ്പെടുത്തിയ തുക = ${money(m.rawSpend)}.`,
            "ഇതിന് ഓരോ ₹100-നും ₹18 GST നികുതി കൂടിയുണ്ട്.",
            `പരസ്യത്തിന്റെ GST = ${money(m.rawSpend)} × 18 ÷ 100 = ${money(m.adGst)}.`,
          ]} result={`പരസ്യവും നികുതിയും ചേർത്ത് = ${money(m.rawSpend)} + ${money(m.adGst)} = ${money(m.spend)}`} />
          <Step title="6. വേറെ എന്തൊക്കെ ചെലവായി?" lines={expenses.length
            ? expenses.map((expense) => `${expense.description || "മറ്റൊരു ചെലവ്"}: ${money(expense.amount)}`)
            : ["ഈ ദിവസത്തേക്ക് വേറെ ചെലവുകളൊന്നും ചേർത്തിട്ടില്ല."]
          } result={`മറ്റു ചെലവുകൾ ആകെ = ${money(m.expenses)}`} />
          <Step title="7. ഇനി കണക്കിൽ കുറയ്ക്കേണ്ട GST എത്ര?" lines={[
            `വാങ്ങിയവരിൽ നിന്ന് വിലയോടൊപ്പം വാങ്ങിയ GST = ${money(m.gst)}. ഇത് അന്ന് വിൽപ്പനയോടൊപ്പം സൂക്ഷിച്ച തുകയാണ്.`,
            `പരസ്യത്തിന് കൊടുത്ത GST = ${money(m.adGst)}. ആ തുക വീണ്ടും കുറയ്ക്കാതിരിക്കാൻ ഇവിടെ ഒഴിവാക്കുന്നു.`,
            `${money(m.gst)} − ${money(m.adGst)} = ${money(m.gstPayable)}.`,
            ...(m.gstPayable < 0 ? [`ഇത് മൈനസ് തുകയാണ്. അതുകൊണ്ട് ലാഭക്കണക്കിൽ ${money(Math.abs(m.gstPayable))} തിരികെ കൂട്ടുന്നു.`] : []),
          ]} result={`ബാക്കി GST = ${money(m.gstPayable)}`} />
          <Step title="8. എല്ലാം കഴിഞ്ഞ് എത്ര ബാക്കി? (Profit)" lines={[
            `തുടക്കത്തിൽ കിട്ടിയ പണം = ${money(m.totalRevenue)}.`,
            `ആദ്യം ഫീസ് കുറയ്ക്കാം: ${money(m.totalRevenue)} − ${money(m.totalCommission)} = ${money(m.totalRevenue - m.totalCommission)}.`,
            `പിന്നെ പരസ്യച്ചെലവ് കുറയ്ക്കാം: ${money(m.totalRevenue - m.totalCommission)} − ${money(m.spend)} = ${money(m.totalRevenue - m.totalCommission - m.spend)}.`,
            `പിന്നെ മറ്റു ചെലവുകൾ കുറയ്ക്കാം: ${money(m.totalRevenue - m.totalCommission - m.spend)} − ${money(m.expenses)} = ${money(m.totalRevenue - m.totalCommission - m.spend - m.expenses)}.`,
            m.gstPayable < 0
              ? `GST-യിലെ മൈനസ് തുക തിരികെ കൂട്ടാം: ${money(m.totalRevenue - m.totalCommission - m.spend - m.expenses)} + ${money(Math.abs(m.gstPayable))} = ${money(m.profit)}.`
              : `അവസാനം ബാക്കി GST കുറയ്ക്കാം: ${money(m.totalRevenue - m.totalCommission - m.spend - m.expenses)} − ${money(m.gstPayable)} = ${money(m.profit)}.`,
          ]} result={m.profit >= 0 ? `ബാക്കിയുള്ള ലാഭം = ${money(m.profit)}` : `ചെലവ് കിട്ടിയ പണത്തേക്കാൾ കൂടുതലാണ്. നഷ്ടം = ${money(Math.abs(m.profit))}`} />
          <Step title="9. ഒരാളെ വാങ്ങിപ്പിക്കാൻ എത്ര പരസ്യച്ചെലവ്? (CAC)" lines={[
            m.qty > 0 ? `പരസ്യത്തിന് നികുതി ഉൾപ്പെടെ ${money(m.spend)} ചെലവായി. ${m.qty} പേർ വാങ്ങി. ഈ ചെലവ് അവർക്കെല്ലാം തുല്യമായി വീതിക്കാം.` : "ആരും വാങ്ങിയിട്ടില്ല. അതുകൊണ്ട് ഒരാൾക്കുള്ള ചെലവ് ഇപ്പോൾ പറയാനാവില്ല. പേജിൽ — എന്നാണ് കാണിക്കുക.",
            ...(m.qty > 0 ? [`${money(m.spend)} ÷ ${m.qty} പേർ = ${money(m.cac)}.`] : []),
          ]} result={m.qty > 0 ? `ഒരാൾക്കുള്ള ശരാശരി പരസ്യച്ചെലവ് = ${money(m.cac)}` : undefined} />
          <Step title="10. പരസ്യത്തിന്റെ മറ്റു വിവരങ്ങൾ" lines={[
            "ഇവ Facebook-ൽ നിന്ന് വന്നതോ നിങ്ങൾ ചേർത്തതോ ആയ വിവരങ്ങളാണ്. ഇവിടെ പുതുതായി കണക്കാക്കുന്നില്ല.",
            `Impressions: പരസ്യം കാണിച്ച ആകെ തവണ = ${ad.impressions}.`,
            `Clicks: പരസ്യത്തിൽ അമർത്തിയ തവണ = ${ad.clicks}.`,
            `Reach: പരസ്യം കണ്ട ആളുകളുടെ എണ്ണം = ${ad.reach}.`,
            `CTR: 100 തവണ പരസ്യം കാണിക്കുമ്പോൾ ശരാശരി ${rate(ad.ctr)} clicks.`,
            `CPC: ഒരു click-നുള്ള ശരാശരി ചെലവ് = ${money(ad.cpc)}.`,
            `Frequency: ഒരാൾ ശരാശരി ${rate(ad.frequency)} തവണ പരസ്യം കണ്ടു.`,
          ]} />
          <p className="py-3 text-xs text-muted-foreground">വായിക്കാൻ എളുപ്പമാകാൻ പൈസ രണ്ടക്കത്തിൽ വരെ കാണിക്കുന്നു. കണക്കിൽ മുഴുവൻ തുകയും ഉപയോഗിക്കുന്നതിനാൽ കൂട്ടിനോക്കുമ്പോൾ ചെറിയ പൈസ വ്യത്യാസം തോന്നാം.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}