import {
  ChatCircleDots,
  ChatText,
  EnvelopeSimple,
  InstagramLogo,
  MessengerLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";

export const CHANNEL_ICONS: Record<ChannelId, Icon> = {
  whatsapp: WhatsappLogo,
  instagram: InstagramLogo,
  messenger: MessengerLogo,
  email: EnvelopeSimple,
  sms: ChatText,
  livechat: ChatCircleDots,
};
