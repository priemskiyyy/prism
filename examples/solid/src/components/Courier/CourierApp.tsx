import { createSignal, Show } from "solid-js";
import type { Component } from "solid-js";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { CARD_CLASS_NAME } from "examples/shared/ui/styles/cardStyles";
import { MaintenanceBanner } from "src/components/Courier/MaintenanceBanner";
import { StatusBar } from "src/components/Courier/StatusBar";
import { UserSwitcher } from "src/components/Courier/UserSwitcher";
import { WorkspaceTabs } from "src/components/Courier/WorkspaceTabs";
import { WorkspaceView } from "src/components/Courier/WorkspaceView";

type CourierAppProps = {
  membership: Membership;
  onWorkspaceSelect: (workspaceId: WorkspaceId) => void;
  onUserSelect: (userId: UserId) => void;
};

export const CourierApp: Component<CourierAppProps> = (props) => {
  const [markers, setMarkers] = createSignal(true);

  return (
    <section
      aria-label="Courier"
      class={`min-w-0 overflow-hidden ${CARD_CLASS_NAME}`}
    >
      <header class="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <WorkspaceTabs
          membership={props.membership}
          onWorkspaceSelect={props.onWorkspaceSelect}
        />
        <div class="ml-auto">
          <UserSwitcher
            userId={props.membership.userId}
            onUserSelect={props.onUserSelect}
          />
        </div>
      </header>
      <MaintenanceBanner markers={markers()} />
      <Show when={props.membership.workspaceId} keyed>
        {(workspaceId) => (
          <WorkspaceView workspaceId={workspaceId} markers={markers()} />
        )}
      </Show>
      <StatusBar
        context={getCourierContext(props.membership)}
        markers={markers()}
        onMarkersToggle={() => setMarkers(!markers())}
      />
    </section>
  );
};
