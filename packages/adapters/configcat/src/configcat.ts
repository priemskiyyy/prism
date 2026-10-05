import { EvaluationErrorCode } from "@configcat/sdk";
import type { IConfigCatClient, IUser } from "@configcat/sdk";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";

export type ConfigCatOptions<C> = {
  client: IConfigCatClient;
  user: (context: C) => IUser;
};

export const configcat = <C>({
  client,
  user,
}: ConfigCatOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "configcat",
    open: ({ invalidate }) => {
      client.on("configChanged", invalidate);

      return {
        identify: async () => {
          await client.waitForReady();
        },
        read: ({ context, flags }) => {
          const snapshot = client.snapshot();
          const configcatUser = user(context);
          const evaluations = new Map<string, Evaluation>();

          for (const { key } of flags) {
            const result = snapshot.getValueDetails(key, null, configcatUser);

            if (result.errorCode === EvaluationErrorCode.SettingKeyMissing) {
              continue;
            }

            if (result.isDefaultValue) {
              evaluations.set(key, {
                error: new PrismError({
                  code: "EVALUATION_FAILED",
                  key,
                  cause: result.errorException,
                }),
              });
              continue;
            }

            evaluations.set(key, {
              value: result.value,
              variant:
                typeof result.variationId === "string"
                  ? result.variationId
                  : undefined,
            });
          }

          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          client.off("configChanged", invalidate);
        },
      };
    },
  });
