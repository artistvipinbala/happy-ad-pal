import { createFileRoute } from "@tanstack/react-router";
import AIAdvisor from "@/pages/AIAdvisor";

export const Route = createFileRoute("/_app/advisor")({
  head: () => ({
    meta: [
      { title: "AI Advisor | Ad Profit Tracker" },
      {
        name: "description",
        content: "AI-powered insights on your ad performance and profitability.",
      },
      { property: "og:title", content: "AI Advisor | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "AI-powered insights on your ad performance and profitability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AIAdvisor,
});
