import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export type InboxSelection = {
  workspaceId: WorkspaceId;
  channels: ChannelId[];
  filter: ChannelId | undefined;
  selectedId: string | undefined;
};
