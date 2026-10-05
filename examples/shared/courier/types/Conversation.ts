import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export type Conversation = {
  id: string;
  workspaceId: WorkspaceId;
  channel: ChannelId;
  contact: string;
  preview: string;
  time: string;
  unread: number;
  messages: { from: "contact" | "agent"; text: string }[];
};
