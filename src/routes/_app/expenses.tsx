import { createFileRoute } from "@tanstack/react-router";
import Expenses from "@/pages/Expenses";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses & Sales | Ad Profit Tracker" },
      {
        name: "description",
        content: "Track business expenses and TagMango sales revenue.",
      },
      { property: "og:title", content: "Expenses & Sales | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "Track business expenses and TagMango sales revenue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Expenses,
});
