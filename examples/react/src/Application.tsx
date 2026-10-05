import type React from "react";
import { PrismDevtools } from "@priemskiyyy/prism-devtools/react";
import { PrismProvider } from "@priemskiyyy/prism-react";
import { useEffect, useState } from "react";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { findMembership } from "examples/shared/courier/directory/findMembership";
import { findUserMembership } from "examples/shared/courier/directory/findUserMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { courierFlags } from "examples/shared/courier/flags";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { reportError } from "examples/shared/courier/utils/reportError";
import { CourierApp } from "src/components/Courier/CourierApp";
import { FlagsPanel } from "src/components/Flags/FlagsPanel";
import { Footer } from "src/components/Footer/Footer";
import { Header } from "src/components/Header/Header";
import { Hero } from "src/components/Hero/Hero";
import { LabPanel } from "src/components/Lab/LabPanel";
import { RequestLogPanel } from "src/components/Lab/RequestLogPanel";
import { ProvidersPanel } from "src/components/Providers/ProvidersPanel";
import { Section } from "src/components/Section/Section";
import { TimelinePanel } from "src/components/Timeline/TimelinePanel";

type ApplicationProps = {
  backend: FlagBackend;
  getHost: (id: ProviderId) => ProviderHost;
};

export const Application: React.FunctionComponent<ApplicationProps> = ({
  backend,
  getHost,
}) => {
  const [membership, setMembership] = useState(INITIAL_MEMBERSHIP);

  const [runtime, setRuntime] = useState(() =>
    createCourierRuntime(
      getHost("HTTP"),
      getCourierContext(INITIAL_MEMBERSHIP),
    ),
  );

  useEffect(() => {
    runtime.start().catch(reportError);
  }, [runtime]);

  const selectMembership = (next: Membership) => {
    setMembership(next);
    runtime.changeContext(getCourierContext(next)).catch(reportError);
  };

  const replaceRuntime = (provider: ProviderId) => {
    runtime.dispose().catch(reportError);
    setRuntime(
      createCourierRuntime(getHost(provider), getCourierContext(membership)),
    );
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

  const handleProviderSelect = (provider: ProviderId) => {
    if (provider === runtime.provider) {
      return;
    }

    replaceRuntime(provider);
  };

  const handleRefreshPress = () => {
    runtime.refresh().catch(reportError);
  };

  const handleRestartPress = () => {
    replaceRuntime(runtime.provider);
  };

  return (
    <PrismProvider flags={runtime.flags}>
      <Header provider={runtime.provider} />
      <main className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6">
        <Hero />
        <Section
          id="workspace"
          hint="Switch workspace or user. Plan, role and region change, and every flag follows."
        >
          <CourierApp
            membership={membership}
            onWorkspaceSelect={handleWorkspaceSelect}
            onUserSelect={handleUserSelect}
          />
        </Section>
        <Section
          id="flags"
          hint="Override the composer, then switch workspace. A context change clears every override."
        >
          <FlagsPanel />
        </Section>
        <Section
          id="providers"
          hint="Pick another SDK. The app keeps working and only the adapter changes."
        >
          <ProvidersPanel
            selected={runtime.provider}
            onProviderSelect={handleProviderSelect}
          />
        </Section>
        <Section
          id="lab"
          hint="Set the latency to 1.5 s and switch workspace. Flags show their fallbacks until the new context resolves."
        >
          <div className="grid gap-3 xl:grid-cols-2">
            <LabPanel
              backend={backend}
              provider={runtime.provider}
              onRefreshPress={handleRefreshPress}
            />
            <RequestLogPanel backend={backend} />
          </div>
        </Section>
        <Section
          id="timeline"
          hint="Go offline and press Refresh. The status turns red while every value stays."
        >
          <TimelinePanel
            runtime={runtime}
            onRefreshPress={handleRefreshPress}
            onRestartPress={handleRestartPress}
          />
        </Section>
      </main>
      <Footer />
      <PrismDevtools flags={runtime.flags} definitions={courierFlags} />
    </PrismProvider>
  );
};
