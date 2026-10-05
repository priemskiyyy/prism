import { createMemo, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import { getInbox } from "examples/shared/courier/inbox/getInbox";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { CampaignsCard } from "src/components/Courier/CampaignsCard";
import { ChannelNav } from "src/components/Courier/ChannelNav";
import { ContactsCard } from "src/components/Courier/ContactsCard";
import { InboxPanel } from "src/components/Courier/InboxPanel";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type WorkspaceViewProps = {
  workspaceId: WorkspaceId;
  markers: boolean;
};

export const WorkspaceView: Component<WorkspaceViewProps> = (props) => {
  const channels = useFlag("channels");
  const [filter, setFilter] = createSignal<ChannelId | undefined>(undefined);

  const [selectedId, setSelectedId] = createSignal<string | undefined>(
    undefined,
  );

  const inbox = createMemo(() =>
    getInbox({
      workspaceId: props.workspaceId,
      channels: channels(),
      filter: filter(),
      selectedId: selectedId(),
    }),
  );

  return (
    <div class="grid min-w-0 md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-[auto_1fr]">
      <nav
        aria-label="Inbox"
        class="min-w-0 border-b border-zinc-200 bg-zinc-50/80 p-4 pt-6 md:border-r md:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <FlagRegion flagKeys={["channels"]} markers={props.markers}>
          <ChannelNav
            channels={channels()}
            inbox={inbox()}
            onFilterSelect={setFilter}
          />
        </FlagRegion>
      </nav>
      <div class="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
        <InboxPanel
          inbox={inbox()}
          markers={props.markers}
          onConversationSelect={setSelectedId}
        />
      </div>
      <aside
        aria-label="Plan usage"
        class="grid min-w-0 content-end gap-6 border-t border-zinc-200 bg-zinc-50/80 p-4 pt-6 sm:grid-cols-2 md:grid-cols-1 md:border-t-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <FlagRegion flagKeys={["contactLimit"]} markers={props.markers}>
          <ContactsCard workspaceId={props.workspaceId} />
        </FlagRegion>
        <FlagRegion flagKeys={["campaigns"]} markers={props.markers}>
          <CampaignsCard />
        </FlagRegion>
      </aside>
    </div>
  );
};
