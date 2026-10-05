import { describe, expect, test, vi } from "vitest";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { COURIER_CONTEXTS } from "examples/shared/courier/constants/courierContexts";
import { COURIER_FLAG_KEYS } from "examples/shared/courier/constants/courierFlagKeys";
import { PROVIDER_IDS } from "examples/shared/courier/constants/providerIds";
import { courierFlags } from "examples/shared/courier/flags";
import { createProviderHosts } from "examples/shared/courier/providers/createProviderHosts";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { CourierRuntime } from "examples/shared/courier/types/CourierRuntime";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";

const getExpectedValues = (backend: FlagBackend, context: CourierContext) => {
  const evaluations = backend.evaluate(context);

  return Object.fromEntries(
    COURIER_FLAG_KEYS.map((key) => {
      const definition = courierFlags[key];

      return [key, evaluations.get(definition.key ?? key)?.value];
    }),
  );
};

const getValues = (runtime: CourierRuntime) =>
  Object.fromEntries(
    COURIER_FLAG_KEYS.map((key) => [key, runtime.flags.flag(key).get()]),
  );

const [northwind] = COURIER_CONTEXTS;

describe.each(PROVIDER_IDS)("the %s provider", (id) => {
  test("serves every membership exactly the backend's values", async () => {
    if (northwind === undefined) {
      throw new Error("Expected a membership.");
    }

    const backend = createFlagBackend({ latency: 0 });

    const runtime = createCourierRuntime(
      createProviderHosts(backend)(id),
      northwind,
    );

    try {
      await runtime.start();

      for (const context of COURIER_CONTEXTS) {
        await runtime.flags.context(context);
        expect(getValues(runtime)).toEqual(getExpectedValues(backend, context));
      }
    } finally {
      await runtime.dispose();
    }
  });

  test("follows a pushed rule change and a corrupt payload fails only its flag", async () => {
    if (northwind === undefined) {
      throw new Error("Expected a membership.");
    }

    const backend = createFlagBackend({ latency: 0 });

    const runtime = createCourierRuntime(
      createProviderHosts(backend)(id),
      northwind,
    );

    try {
      await runtime.start();
      expect(runtime.flags.flag("assistant").get()).toBe(false);
      backend.setAssistantRollout("EVERYONE");
      await vi.waitFor(() =>
        expect(runtime.flags.flag("assistant").get()).toBe(true),
      );
      backend.setCorruptChannels(true);
      await vi.waitFor(() =>
        expect(runtime.flags.flag("channels").details.get()).toMatchObject({
          value: ["whatsapp"],
          resolution: "error",
          error: { code: "VALIDATION", key: "channels" },
        }),
      );
      expect(runtime.flags.flag("assistant").get()).toBe(true);
    } finally {
      await runtime.dispose();
    }
  });
});
