import type { z } from "zod";
import type { UploadLimits } from "examples/shared/courier/flags";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Plan } from "examples/shared/courier/types/Plan";

export const CHANNELS_BY_PLAN: Record<Plan, ChannelId[]> = {
  starter: ["whatsapp", "instagram"],
  business: ["whatsapp", "instagram", "messenger", "email"],
  enterprise: [
    "whatsapp",
    "instagram",
    "messenger",
    "email",
    "sms",
    "livechat",
  ],
};

export const UPLOADS_BY_PLAN: Record<Plan, z.infer<typeof UploadLimits>> = {
  starter: { maxFiles: 3, maxMegabytes: 10 },
  business: { maxFiles: 10, maxMegabytes: 25 },
  enterprise: { maxFiles: 20, maxMegabytes: 100 },
};

export const CONTACT_LIMITS: Record<Plan, number> = {
  starter: 1_000,
  business: 25_000,
  enterprise: 250_000,
};

export const DAILY_RECIPIENTS: Record<Plan, number> = {
  starter: 0,
  business: 5_000,
  enterprise: 50_000,
};
