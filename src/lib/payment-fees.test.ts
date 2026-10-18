import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { paymentFees } from "./payment-fees";

const expect = (actual: number) => ({ toBe: (expected: number) => assert.equal(actual, expected) });

const sale = { date: "2026-10-01", quantity: 1, amount_per_sale: 1000 };

describe("successful purchase commissions", () => {
  test("domestic is 3.5% for all October 2026 sales and later", () => {
    for (const date of ["2026-10-01", "2026-10-18", "2026-10-31", "2026-11-01"]) {
      expect(paymentFees({ ...sale, date }).total).toBe(35);
    }
  });
  test("previous domestic purchases remain 2.5%", () => {
    expect(paymentFees({ ...sale, date: "2026-09-30" }).total).toBe(25);
  });
  test("current international purchases are 5%", () => {
    expect(paymentFees({ ...sale, usd_quantity: 1, usd_amount_inr: 1000 }).total).toBe(50);
    expect(paymentFees({ ...sale, eur_quantity: 1, eur_amount_inr: 1000 }).total).toBe(50);
  });
  test("previous international purchases are also 5%, not CRM's 2.5%", () => {
    expect(paymentFees({ ...sale, date: "2026-09-30", usd_quantity: 1, usd_amount_inr: 1000 }).total).toBe(50);
    expect(paymentFees({ ...sale, date: "2026-09-30", eur_quantity: 1, eur_amount_inr: 1000 }).total).toBe(50);
  });
  test("direct GPay stays at 0%", () => {
    expect(paymentFees({ ...sale, gpay_quantity: 1 }).total).toBe(0);
  });
  test("mixed channels charge only their own gross amounts", () => {
    expect(paymentFees({ ...sale, quantity: 5, gpay_quantity: 1, usd_quantity: 1, eur_quantity: 1, usd_amount_inr: 800, eur_amount_inr: 900 }).total).toBe(155);
  });
  test("historical international fees use saved amounts unless live amounts are explicitly supplied", () => {
    const historic = { ...sale, date: "2026-09-30", usd_quantity: 1, usd_amount_inr: 700 };
    expect(paymentFees(historic).total).toBe(35);
    expect(paymentFees({ ...historic, date: "2026-10-18" }, 800, 0).total).toBe(40);
    expect(paymentFees(historic).total).toBe(35);
  });
});