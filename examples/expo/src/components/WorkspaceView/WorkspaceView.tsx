import type React from "react";
import { useState } from "react";
import { useFlag } from "@priemskiyyy/prism-react";
import { getInbox } from "examples/shared/courier/inbox/getInbox";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { Card } from "src/components/Card/Card";
import { ChannelChips } from "src/components/ChannelChips/ChannelChips";
import { ConversationCard } from "src/components/ConversationCard/ConversationCard";
import { ConversationList } from "src/components/ConversationList/ConversationList";
import { PlanCards } from "src/components/PlanCards/PlanCards";

type WorkspaceViewProps = { workspaceId: WorkspaceId };

export const WorkspaceView: React.FunctionComponent<WorkspaceViewProps> = ({
  workspaceId,
}) => {
  const channels = useFlag("channels");
  const [filter, setFilter] = useState<ChannelId | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const inbox = getInbox({ workspaceId, channels, filter, selectedId });

  return (
    <>
      <Card title="Inbox" flagKeys={["channels"]}>
        <ChannelChips
          channels={channels}
          inbox={inbox}
          onFilterSelect={setFilter}
        />
        <ConversationList inbox={inbox} onConversationSelect={setSelectedId} />
      </Card>
      {inbox.selected === undefined ? null : (
        <ConversationCard
          key={inbox.selected.id}
          conversation={inbox.selected}
        />
      )}
      <PlanCards workspaceId={workspaceId} />
    </>
  );
};
