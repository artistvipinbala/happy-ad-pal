export const DOMESTIC_RATE_CHANGE_DATE = "2026-10-01";
export const CURRENT_DOMESTIC_RATE = 0.035;
export const PREVIOUS_DOMESTIC_RATE = 0.025;
export const INTERNATIONAL_RATE = 0.05;

export function domesticRateForDate(date: string) {
  return date >= DOMESTIC_RATE_CHANGE_DATE ? CURRENT_DOMESTIC_RATE : PREVIOUS_DOMESTIC_RATE;
}

type FeeSale = {
  date: string;
  quantity: number;
  gpay_quantity?: number | null;
  usd_quantity?: number | null;
  eur_quantity?: number | null;
  amount_per_sale: number;
  usd_amount_inr?: number | null;
  eur_amount_inr?: number | null;
};

// Recorded successful sales only; direct GPay is not a platform purchase.
// International amounts are supplied by the caller so historical FX remains frozen.
export function paymentFees(sale: FeeSale, usdAmount = Number(sale.usd_amount_inr ?? 0), eurAmount = Number(sale.eur_amount_inr ?? 0)) {
  const platformQuantity = Math.max(0, sale.quantity - (sale.gpay_quantity ?? 0) - (sale.usd_quantity ?? 0) - (sale.eur_quantity ?? 0));
  const domestic = platformQuantity * Number(sale.amount_per_sale) * domesticRateForDate(sale.date);
  const international = (usdAmount + eurAmount) * INTERNATIONAL_RATE;
  return { domestic, international, total: domestic + international };
}