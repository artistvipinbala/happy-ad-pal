import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/pages/SettingsPage";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Ad Profit Tracker" },
      {
        name: "description",
        content: "Manage account settings for the Ad Profit Tracker.",
      },
      { property: "og:title", content: "Settings | Ad Profit Tracker" },
      {
        property: "og:description",
        content: "Manage account settings for the Ad Profit Tracker.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
