import type React from "react";
import { useFlag } from "@priemskiyyy/prism-react";
import { useState } from "react";
import { getInbox } from "examples/shared/courier/inbox/getInbox";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { CampaignsCard } from "src/components/Courier/CampaignsCard";
import { ChannelNav } from "src/components/Courier/ChannelNav";
import { ContactsCard } from "src/components/Courier/ContactsCard";
import { Inbox } from "src/components/Courier/Inbox";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type WorkspaceViewProps = {
  workspaceId: WorkspaceId;
  markers: boolean;
};

export const WorkspaceView: React.FunctionComponent<WorkspaceViewProps> = ({
  workspaceId,
  markers,
}) => {
  const channels = useFlag("channels");
  const [filter, setFilter] = useState<ChannelId | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const inbox = getInbox({ workspaceId, channels, filter, selectedId });

  return (
    <div className="grid min-w-0 md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-[auto_1fr]">
      <nav
        aria-label="Inbox"
        className="min-w-0 border-b border-zinc-200 bg-zinc-50/80 p-4 pt-6 md:border-r md:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <FlagRegion flagKeys={["channels"]} markers={markers}>
          <ChannelNav
            channels={channels}
            conversations={inbox.available}
            filter={inbox.filter}
            onFilterSelect={setFilter}
          />
        </FlagRegion>
      </nav>
      <div className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
        <Inbox
          conversations={inbox.conversations}
          selected={inbox.selected}
          markers={markers}
          onConversationSelect={setSelectedId}
        />
      </div>
      <aside
        aria-label="Plan usage"
        className="grid min-w-0 content-end gap-6 border-t border-zinc-200 bg-zinc-50/80 p-4 pt-6 sm:grid-cols-2 md:grid-cols-1 md:border-t-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <FlagRegion flagKeys={["contactLimit"]} markers={markers}>
          <ContactsCard workspaceId={workspaceId} />
        </FlagRegion>
        <FlagRegion flagKeys={["campaigns"]} markers={markers}>
          <CampaignsCard />
        </FlagRegion>
      </aside>
    </div>
  );
};
