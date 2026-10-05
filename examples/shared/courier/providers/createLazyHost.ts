import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";

export const createLazyHost = (
  id: ProviderId,
  load: () => Promise<ProviderHost>,
): ProviderHost => {
  let loaded: ProviderHost | undefined;

  const getLoaded = () => {
    if (loaded === undefined) {
      throw new Error(`The ${id} SDK is still loading.`);
    }

    return loaded;
  };

  return {
    id,
    ready: load().then((host) => {
      loaded = host;

      return host.ready;
    }),
    createAdapter: () => ({
      name: id,
      open: (observer) => getLoaded().createAdapter().open(observer),
    }),
    updates: (context, refresh) => getLoaded().updates(context, refresh),
  };
};
