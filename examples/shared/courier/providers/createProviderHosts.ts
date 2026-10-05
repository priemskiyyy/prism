import { createHttpHost } from "examples/shared/courier/providers/createHttpHost";
import { createLazyHost } from "examples/shared/courier/providers/createLazyHost";
import { createMemoryHost } from "examples/shared/courier/providers/createMemoryHost";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";

export const createProviderHosts = (backend: FlagBackend) => {
  const factories = {
    HTTP: createHttpHost,
    MEMORY: createMemoryHost,
    OPENFEATURE: () =>
      createLazyHost("OPENFEATURE", async () => {
        const { createOpenFeatureHost } =
          await import("examples/shared/courier/providers/createOpenFeatureHost");

        return createOpenFeatureHost(backend);
      }),
    GROWTHBOOK: () =>
      createLazyHost("GROWTHBOOK", async () => {
        const { createGrowthBookHost } =
          await import("examples/shared/courier/providers/createGrowthBookHost");

        return createGrowthBookHost(backend);
      }),
    UNLEASH: () =>
      createLazyHost("UNLEASH", async () => {
        const { createUnleashHost } =
          await import("examples/shared/courier/providers/createUnleashHost");

        return createUnleashHost(backend);
      }),
    STATSIG: () =>
      createLazyHost("STATSIG", async () => {
        const { createStatsigHost } =
          await import("examples/shared/courier/providers/createStatsigHost");

        return createStatsigHost(backend);
      }),
  } satisfies Record<ProviderId, (backend: FlagBackend) => ProviderHost>;

  const hosts = new Map<ProviderId, ProviderHost>();

  return (id: ProviderId) => {
    const existing = hosts.get(id);

    if (existing !== undefined) {
      return existing;
    }

    const host = factories[id](backend);

    hosts.set(id, host);

    return host;
  };
};
