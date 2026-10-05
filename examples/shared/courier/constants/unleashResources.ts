import type { UnleashResource } from "@priemskiyyy/prism-unleash";

export const UNLEASH_RESOURCES: Record<string, UnleashResource> = {
  channels: { toggle: "channels", select: "payload" },
  "ai-assistant": { toggle: "ai-assistant", select: "enabled" },
  "new-composer": { toggle: "new-composer", select: "enabled" },
  "inbox-layout": { toggle: "inbox-layout", select: "payload" },
  uploads: { toggle: "uploads", select: "payload" },
  campaigns: { toggle: "campaigns", select: "payload" },
  "contact-limit": { toggle: "contact-limit", select: "payload" },
  maintenance: { toggle: "maintenance", select: "payload" },
};
