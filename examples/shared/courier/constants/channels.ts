import type { ChannelId } from "examples/shared/courier/types/ChannelId";

export const CHANNEL_IDS: ChannelId[] = [
  "whatsapp",
  "instagram",
  "messenger",
  "email",
  "sms",
  "livechat",
];

export const CHANNEL_LABELS: Record<ChannelId, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  email: "Email",
  sms: "SMS",
  livechat: "Live chat",
};
