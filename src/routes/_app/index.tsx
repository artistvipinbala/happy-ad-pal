import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Ad Profit Tracker" },
      {
        name: "description",
        content:
          "Overview of Facebook ad spend, TagMango sales, and profit for Artist Vipin Bala.",
      },
      { property: "og:title", content: "Dashboard | Ad Profit Tracker" },
      {
        property: "og:description",
        content:
          "Overview of Facebook ad spend, TagMango sales, and profit for Artist Vipin Bala.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});
