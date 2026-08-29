import { createFileRoute } from "@tanstack/react-router";
import MonthlyOverview from "@/pages/MonthlyOverview";

export const Route = createFileRoute("/_app/monthly")({
  head: () => ({
    meta: [
      { title: "Monthly Overview | Ad Profit Tracker" },
      {
        name: "description",
        content: "Month-by-month breakdown of ad performance, revenue, and profit.",
      },
      { property: "og:title", content: "Monthly Overview | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "Month-by-month breakdown of ad performance, revenue, and profit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MonthlyOverview,
});
