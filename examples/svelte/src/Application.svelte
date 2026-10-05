<script lang="ts">
  import { setPrism } from "@priemskiyyy/prism-svelte";
  import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
  import { findMembership } from "examples/shared/courier/directory/findMembership";
  import { findUserMembership } from "examples/shared/courier/directory/findUserMembership";
  import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
  import type { CourierRuntime } from "examples/shared/courier/types/CourierRuntime";
  import type { Membership } from "examples/shared/courier/types/Membership";
  import type { UserId } from "examples/shared/courier/types/UserId";
  import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
  import { reportError } from "examples/shared/courier/utils/reportError";
  import CourierApp from "src/components/Courier/CourierApp.svelte";
  import PageHeader from "src/components/PageHeader/PageHeader.svelte";

  type Props = { runtime: CourierRuntime };

  let { runtime }: Props = $props();
  let membership = $state<Membership>(INITIAL_MEMBERSHIP);

  setPrism(() => runtime.flags);

  const selectMembership = (next: Membership) => {
    membership = next;
    runtime.changeContext(getCourierContext(next)).catch(reportError);
  };

  const handleWorkspaceSelect = (workspaceId: WorkspaceId) => {
    const next = findMembership(membership.userId, workspaceId);

    if (next === undefined) {
      return;
    }

    selectMembership(next);
  };

  const handleUserSelect = (userId: UserId) => {
    const next = findUserMembership(userId, membership.workspaceId);

    if (next === undefined) {
      return;
    }

    selectMembership(next);
  };
</script>

<PageHeader />
<main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
  <div class="flex max-w-3xl flex-col gap-2">
    <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
      Courier on Svelte
    </h2>
    <p class="text-base text-zinc-600 dark:text-zinc-400">
      The inbox from the React example, written with Svelte stores. Pick another
      workspace or user and every flag follows. The Prism button in the corner
      opens the devtools, where you can override any flag.
    </p>
  </div>
  <CourierApp
    {membership}
    onWorkspaceSelect={handleWorkspaceSelect}
    onUserSelect={handleUserSelect}
  />
</main>
