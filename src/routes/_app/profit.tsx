import { createFileRoute } from "@tanstack/react-router";
import ProfitCalculator from "@/pages/ProfitCalculator";

export const Route = createFileRoute("/_app/profit")({
  head: () => ({
    meta: [
      { title: "Profit Calculator | Ad Profit Tracker" },
      {
        name: "description",
        content: "Calculate net profit from ad spend, sales, and expenses.",
      },
      { property: "og:title", content: "Profit Calculator | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "Calculate net profit from ad spend, sales, and expenses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfitCalculator,
});
