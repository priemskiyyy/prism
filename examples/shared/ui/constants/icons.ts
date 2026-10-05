import addressBook from "@phosphor-icons/core/duotone/address-book-duotone.svg?url";
import chatCircleDots from "@phosphor-icons/core/duotone/chat-circle-dots-duotone.svg?url";
import chatText from "@phosphor-icons/core/duotone/chat-text-duotone.svg?url";
import chatsTeardrop from "@phosphor-icons/core/duotone/chats-teardrop-duotone.svg?url";
import envelopeSimple from "@phosphor-icons/core/duotone/envelope-simple-duotone.svg?url";
import instagramLogo from "@phosphor-icons/core/duotone/instagram-logo-duotone.svg?url";
import megaphone from "@phosphor-icons/core/duotone/megaphone-duotone.svg?url";
import messengerLogo from "@phosphor-icons/core/duotone/messenger-logo-duotone.svg?url";
import tray from "@phosphor-icons/core/duotone/tray-duotone.svg?url";
import whatsappLogo from "@phosphor-icons/core/duotone/whatsapp-logo-duotone.svg?url";
import flag from "@phosphor-icons/core/bold/flag-bold.svg?url";
import lock from "@phosphor-icons/core/bold/lock-bold.svg?url";
import paperPlaneRight from "@phosphor-icons/core/bold/paper-plane-right-bold.svg?url";
import sparkle from "@phosphor-icons/core/fill/sparkle-fill.svg?url";
import warning from "@phosphor-icons/core/fill/warning-fill.svg?url";
import paperclip from "@phosphor-icons/core/regular/paperclip.svg?url";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";

export const ICONS = {
  addressBook,
  chatsTeardrop,
  flag,
  lock,
  megaphone,
  paperPlaneRight,
  paperclip,
  sparkle,
  tray,
  warning,
};

export const CHANNEL_ICONS: Record<ChannelId, string> = {
  whatsapp: whatsappLogo,
  instagram: instagramLogo,
  messenger: messengerLogo,
  email: envelopeSimple,
  sms: chatText,
  livechat: chatCircleDots,
};
