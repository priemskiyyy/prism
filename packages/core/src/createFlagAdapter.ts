import { PrismError } from "src/PrismError";
import type { FlagAdapter } from "src/types/FlagAdapter";

export const createFlagAdapter = <C>(
  adapter: FlagAdapter<C>,
): FlagAdapter<C> => ({
  name: adapter.name,
  open: (observer) => {
    let disposal: Promise<void> | undefined;

    const assertSessionOpen = () => {
      if (disposal !== undefined) {
        throw new PrismError({ code: "DISPOSED" });
      }
    };

    const session = adapter.open({
      invalidate: () => {
        if (disposal === undefined) {
          observer.invalidate();
        }
      },
    });

    return {
      identify: (context) => {
        assertSessionOpen();

        return session.identify(context);
      },
      read: (request) => {
        assertSessionOpen();

        return session.read(request);
      },
      dispose: () => {
        if (disposal !== undefined) {
          return disposal;
        }

        disposal = Promise.resolve().then(() => session.dispose());

        return disposal;
      },
    };
  },
});
