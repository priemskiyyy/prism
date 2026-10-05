import type { StatsigResource } from "@priemskiyyy/prism-statsig";

export const STATSIG_RESOURCES: Record<string, StatsigResource> = {
  channels: { type: "config", name: "channels", parameter: "value" },
  "ai-assistant": { type: "gate", name: "ai-assistant" },
  "new-composer": { type: "gate", name: "new-composer" },
  "inbox-layout": {
    type: "experiment",
    name: "inbox-layout",
    parameter: "value",
  },
  uploads: { type: "config", name: "uploads", parameter: "value" },
  campaigns: { type: "config", name: "campaigns", parameter: "value" },
  "contact-limit": {
    type: "config",
    name: "contact-limit",
    parameter: "value",
  },
  maintenance: { type: "config", name: "maintenance", parameter: "value" },
};
