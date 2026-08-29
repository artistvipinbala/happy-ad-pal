import { createFileRoute } from "@tanstack/react-router";
import DailyData from "@/pages/DailyData";

export const Route = createFileRoute("/_app/daily")({
  head: () => ({
    meta: [
      { title: "Daily Data | Ad Profit Tracker" },
      {
        name: "description",
        content: "Enter and review daily ad spend, leads, and sales entries.",
      },
      { property: "og:title", content: "Daily Data | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "Enter and review daily ad spend, leads, and sales entries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DailyData,
});
