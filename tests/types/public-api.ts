import { expectTypeOf } from "vitest";
import { z } from "zod";
import { createFlagAdapter, flag, Prism } from "@priemskiyyy/prism";
import type {
  Evaluations,
  FlagSession,
  JsonValue,
  ReadRequest,
  StandardSchema,
} from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import type { MockController } from "@priemskiyyy/prism/mock";

const synchronousSession: FlagSession<Record<string, JsonValue>> = {
  identify: () => {},
  read: () => ({}),
  dispose: () => {},
};

const asynchronousSession: typeof synchronousSession = {
  identify: async () => {},
  read: async () => ({}),
  dispose: async () => {},
};

expectTypeOf(synchronousSession).toEqualTypeOf(asynchronousSession);
expectTypeOf(
  asynchronousSession.identify,
).returns.toEqualTypeOf<void | Promise<void>>();
expectTypeOf(asynchronousSession.read).returns.toEqualTypeOf<
  Evaluations | Promise<Evaluations>
>();
expectTypeOf<ReadRequest<{ user: string }>>().toEqualTypeOf<{
  context: { user: string };
  flags: { key: string; fallback: JsonValue }[];
  signal: AbortSignal;
}>();

const evaluations: Evaluations = {
  value: { value: 1 },
  variant: { value: "a", variant: "treatment" },
  failed: { error: new Error("provider") },
};

expectTypeOf(evaluations).toEqualTypeOf<Evaluations>();

// @ts-expect-error An evaluation carries either a value or an error.
const ambiguous: Evaluations = { both: { value: 1, error: new Error() } };

expectTypeOf(ambiguous).toEqualTypeOf<Evaluations>();

const LayoutSchema: StandardSchema<"classic" | "compact"> = {
  "~standard": {
    version: 1,
    vendor: "fixture",
    validate: (value) => {
      if (value === "classic" || value === "compact") {
        return { value };
      }

      return { issues: [{ message: "Unsupported layout." }] };
    },
  },
};

type AppContext = { targetingKey: string; organization?: string };

const adapter = createMockAdapter<AppContext>();

const flags = new Prism({
  adapter,
  flags: {
    enabled: flag(z.boolean(), { fallback: false }),
    count: flag(z.number(), { fallback: 1 }),
    message: flag(z.string(), { fallback: "hello" }),
    layout: flag(LayoutSchema, { fallback: "classic" }),
    nullable: flag(z.json(), { fallback: null }),
    zodLayout: flag(z.enum(["classic", "compact"]), { fallback: "classic" }),
    settings: flag(z.object({ enabled: z.boolean(), count: z.number() }), {
      fallback: { enabled: false, count: 0 },
    }),
  },
  updates: (context, refresh) => {
    expectTypeOf(context).toEqualTypeOf<AppContext>();
    expectTypeOf(refresh).toEqualTypeOf<() => void>();

    return () => {};
  },
  timeout: 5_000,
});

expectTypeOf(flags.flag("enabled").get()).toEqualTypeOf<boolean>();
expectTypeOf(flags.flag("count").get()).toEqualTypeOf<number>();
expectTypeOf(flags.flag("message").get()).toEqualTypeOf<string>();
expectTypeOf(flags.flag("layout").get()).toEqualTypeOf<"classic" | "compact">();
expectTypeOf(flags.flag("zodLayout").get()).toEqualTypeOf<
  "classic" | "compact"
>();
expectTypeOf(flags.flag("settings").get()).toEqualTypeOf<{
  enabled: boolean;
  count: number;
}>();
expectTypeOf(flags.flag("settings").details.get().value).toEqualTypeOf<{
  enabled: boolean;
  count: number;
}>();
expectTypeOf(flags.status.get().state).toEqualTypeOf<
  "idle" | "loading" | "ready" | "error" | "disposed"
>();
expectTypeOf(flags.start({ context: { targetingKey: "user" } })).toEqualTypeOf<
  Promise<void>
>();
expectTypeOf(adapter.controller).toEqualTypeOf<MockController<AppContext>>();

flags.context({ targetingKey: "user", organization: "organization" });
flags.flag("enabled").override(true);
flags.flag("layout").override("compact");

const defaultContextFlags = new Prism({
  adapter: createMockAdapter(),
  flags: { enabled: flag(z.boolean(), { fallback: false }) },
});

defaultContextFlags.context({
  targetingKey: "user",
  groups: ["staff"],
  traits: { locale: "en" },
});

const stringContextFlags = new Prism({
  adapter: createMockAdapter<string>(),
  flags: { enabled: flag(z.boolean(), { fallback: false }) },
});

// @ts-expect-error Contexts are objects even when the adapter's generic is a primitive.
stringContextFlags.start({ context: "user" });
// @ts-expect-error Contexts are objects even when the adapter's generic is a primitive.
stringContextFlags.context("user");
// @ts-expect-error Default contexts accept JSON values, not undefined traits.
defaultContextFlags.context({ targetingKey: undefined });

// @ts-expect-error A schema fallback cannot widen the schema's output union.
flag(LayoutSchema, { fallback: "unsupported" });
// @ts-expect-error The runtime schema fixes the available local keys.
flags.flag("unknown");
// @ts-expect-error Callers cannot choose an unrelated result type.
flags.flag<boolean>("enabled");
// @ts-expect-error Application context comes from the adapter's type argument.
flags.context({ organization: "organization" });
// @ts-expect-error Wrong targeting-key values are rejected before runtime.
flags.context({ targetingKey: 2 });
// @ts-expect-error Override input is bound to the declared flag value.
flags.flag("enabled").override("true");
// @ts-expect-error Enum overrides preserve the validated output union.
flags.flag("layout").override("unsupported");
// @ts-expect-error Every flag declares a schema.
flag(false);
// @ts-expect-error Every flag declares a fallback.
flag(z.boolean(), {});
// @ts-expect-error The fallback has the schema's output type.
flag(z.number(), { fallback: "5" });
// @ts-expect-error Adapters need an open function.
createFlagAdapter({ name: "broken", open: false });
// @ts-expect-error Provider aliases are strings.
flag(z.boolean(), { fallback: false, key: 1 });
new Prism({
  adapter,
  flags: { enabled: flag(z.boolean(), { fallback: false }) },
  // @ts-expect-error Evaluation modes no longer exist.
  evaluation: "silent",
});
new Prism({
  adapter,
  flags: { enabled: flag(z.boolean(), { fallback: false }) },
  // @ts-expect-error Overrides need no configuration.
  overrides: "enabled",
});
new Prism({
  adapter,
  flags: { enabled: flag(z.boolean(), { fallback: false }) },
  // @ts-expect-error There is one read timeout.
  timeouts: { wait: 1 },
});
// @ts-expect-error Refresh takes no options.
flags.refresh({ mode: "network" });
