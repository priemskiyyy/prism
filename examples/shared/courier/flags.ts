import { flag } from "@priemskiyyy/prism";
import { z } from "zod";

export const Channel = z.enum([
  "whatsapp",
  "instagram",
  "messenger",
  "email",
  "sms",
  "livechat",
]);

export const UploadLimits = z.object({
  maxFiles: z.number().int().min(1).max(20),
  maxMegabytes: z.number().positive().max(100),
});

const CampaignLimits = z.object({
  enabled: z.boolean(),
  dailyRecipients: z.number().int().min(0),
});

const MaintenanceNotice = z.object({ message: z.string().min(1) });

export const courierFlags = {
  channels: flag(z.array(Channel).min(1), { fallback: ["whatsapp"] }),
  assistant: flag(z.boolean(), { fallback: false, key: "ai-assistant" }),
  composer: flag(z.boolean(), { fallback: false, key: "new-composer" }),
  layout: flag(z.enum(["classic", "split"]), {
    fallback: "classic",
    key: "inbox-layout",
  }),
  uploads: flag(UploadLimits, { fallback: { maxFiles: 1, maxMegabytes: 5 } }),
  campaigns: flag(CampaignLimits, {
    fallback: { enabled: false, dailyRecipients: 0 },
  }),
  contactLimit: flag(z.number().int().positive(), {
    fallback: 500,
    key: "contact-limit",
  }),
  maintenance: flag(MaintenanceNotice.nullable(), { fallback: null }),
};
