import type React from "react";
import clsx from "clsx";
import { useState } from "react";
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

export const CourierApp: React.FunctionComponent<CourierAppProps> = ({
  membership,
  onWorkspaceSelect,
  onUserSelect,
}) => {
  const [markers, setMarkers] = useState(true);

  return (
    <section
      aria-label="Courier"
      className={clsx("min-w-0 overflow-hidden", CARD_CLASS_NAME)}
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <WorkspaceTabs
          membership={membership}
          onWorkspaceSelect={onWorkspaceSelect}
        />
        <div className="ml-auto">
          <UserSwitcher
            userId={membership.userId}
            onUserSelect={onUserSelect}
          />
        </div>
      </header>
      <MaintenanceBanner markers={markers} />
      <WorkspaceView
        key={membership.workspaceId}
        workspaceId={membership.workspaceId}
        markers={markers}
      />
      <StatusBar
        context={getCourierContext(membership)}
        markers={markers}
        onMarkersToggle={() => setMarkers(!markers)}
      />
    </section>
  );
};
