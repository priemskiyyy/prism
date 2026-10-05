<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";
  import { getInbox } from "examples/shared/courier/inbox/getInbox";
  import type { ChannelId } from "examples/shared/courier/types/ChannelId";
  import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
  import CampaignsCard from "src/components/Courier/CampaignsCard.svelte";
  import ChannelNav from "src/components/Courier/ChannelNav.svelte";
  import ContactsCard from "src/components/Courier/ContactsCard.svelte";
  import InboxPanel from "src/components/Courier/InboxPanel.svelte";
  import FlagRegion from "src/components/FlagRegion/FlagRegion.svelte";

  type Props = {
    workspaceId: WorkspaceId;
    markers: boolean;
  };

  let { workspaceId, markers }: Props = $props();
  let filter = $state<ChannelId | undefined>(undefined);
  let selectedId = $state<string | undefined>(undefined);
  const channels = flagStore("channels");

  const inbox = $derived(
    getInbox({ workspaceId, channels: $channels, filter, selectedId }),
  );
</script>

<div
  class="grid min-w-0 md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-[auto_1fr]"
>
  <nav
    aria-label="Inbox"
    class="min-w-0 border-b border-zinc-200 bg-zinc-50/80 p-4 pt-6 md:border-r md:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/50"
  >
    <FlagRegion flagKeys={["channels"]} {markers}>
      <ChannelNav
        channels={$channels}
        {inbox}
        onFilterSelect={(channel) => (filter = channel)}
      />
    </FlagRegion>
  </nav>
  <div class="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
    <InboxPanel
      {inbox}
      {markers}
      onConversationSelect={(id) => (selectedId = id)}
    />
  </div>
  <aside
    aria-label="Plan usage"
    class="grid min-w-0 content-end gap-6 border-t border-zinc-200 bg-zinc-50/80 p-4 pt-6 sm:grid-cols-2 md:grid-cols-1 md:border-t-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900/50"
  >
    <FlagRegion flagKeys={["contactLimit"]} {markers}>
      <ContactsCard {workspaceId} />
    </FlagRegion>
    <FlagRegion flagKeys={["campaigns"]} {markers}>
      <CampaignsCard />
    </FlagRegion>
  </aside>
</div>
