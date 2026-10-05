<script lang="ts">
  import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
  import type { Membership } from "examples/shared/courier/types/Membership";
  import type { UserId } from "examples/shared/courier/types/UserId";
  import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
  import { CARD_CLASS_NAME } from "examples/shared/ui/styles/cardStyles";
  import MaintenanceBanner from "src/components/Courier/MaintenanceBanner.svelte";
  import StatusBar from "src/components/Courier/StatusBar.svelte";
  import UserSwitcher from "src/components/Courier/UserSwitcher.svelte";
  import WorkspaceTabs from "src/components/Courier/WorkspaceTabs.svelte";
  import WorkspaceView from "src/components/Courier/WorkspaceView.svelte";

  type Props = {
    membership: Membership;
    onWorkspaceSelect: (workspaceId: WorkspaceId) => void;
    onUserSelect: (userId: UserId) => void;
  };

  let { membership, onWorkspaceSelect, onUserSelect }: Props = $props();
  let markers = $state(true);
</script>

<section
  aria-label="Courier"
  class={["min-w-0 overflow-hidden", CARD_CLASS_NAME]}
>
  <header
    class="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"
  >
    <WorkspaceTabs {membership} {onWorkspaceSelect} />
    <div class="ml-auto">
      <UserSwitcher userId={membership.userId} {onUserSelect} />
    </div>
  </header>
  <MaintenanceBanner {markers} />
  {#key membership.workspaceId}
    <WorkspaceView workspaceId={membership.workspaceId} {markers} />
  {/key}
  <StatusBar
    context={getCourierContext(membership)}
    {markers}
    onMarkersToggle={() => (markers = !markers)}
  />
</section>
