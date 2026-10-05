import { Prism, createFlagAdapter, flag } from "@priemskiyyy/prism";
import type {
  Evaluations,
  FlagDefinitions,
  JsonValue,
} from "@priemskiyyy/prism";
import { bench, describe } from "vitest";
import { z } from "zod";

type BenchContext = { version: number };

const toEvaluations = (values: Record<string, JsonValue>): Evaluations =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, { value }]),
  );

const start = async (
  flags: FlagDefinitions,
  read: (context: BenchContext) => Evaluations,
  listeners = 0,
) => {
  const runtime = new Prism({
    flags,
    adapter: createFlagAdapter<BenchContext>({
      name: "bench",
      open: () => ({
        identify: () => {},
        read: ({ context }) => read(context),
        dispose: () => {},
      }),
    }),
  });

  for (const key of Object.keys(flags)) {
    for (let index = 0; index < listeners; index += 1) {
      runtime.flag(key).subscribe(() => {});
    }
  }

  await runtime.start({ context: { version: 0 } });

  return runtime;
};

const booleanFlags = (count: number) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `flag${index}`,
      flag(z.boolean(), { fallback: false }),
    ]),
  );

const booleanValues = (count: number, value: boolean) =>
  toEvaluations(
    Object.fromEntries(
      Array.from({ length: count }, (_, index) => [`flag${index}`, value]),
    ),
  );

const courierFlags = {
  channels: flag(z.array(z.enum(["whatsapp", "email", "sms"])).min(1), {
    fallback: ["whatsapp"],
  }),
  assistant: flag(z.boolean(), { fallback: false }),
  composer: flag(z.boolean(), { fallback: false }),
  layout: flag(z.enum(["classic", "split"]), { fallback: "classic" }),
  uploads: flag(z.object({ maxFiles: z.number().int().min(1) }), {
    fallback: { maxFiles: 1 },
  }),
  campaigns: flag(z.object({ enabled: z.boolean() }), {
    fallback: { enabled: false },
  }),
  contactLimit: flag(z.number().int().positive(), { fallback: 500 }),
  maintenance: flag(z.object({ message: z.string() }).nullable(), {
    fallback: null,
  }),
};

const courierValues = toEvaluations({
  channels: ["whatsapp", "email"],
  assistant: true,
  composer: true,
  layout: "split",
  uploads: { maxFiles: 10 },
  campaigns: { enabled: true },
  contactLimit: 25_000,
  maintenance: null,
});

const Rule = z.object({
  id: z.string(),
  weight: z.number(),
  segments: z.array(z.string()),
  enabled: z.boolean(),
});

const configFlags = {
  config: flag(z.object({ rules: z.array(Rule) }), {
    fallback: { rules: [] },
  }),
};

const rules = Array.from({ length: 400 }, (_, index) => ({
  id: `rule-${index}`,
  weight: index / 400,
  segments: ["eu", "pro", `cohort-${index % 17}`],
  enabled: index % 3 === 0,
}));

const configValues = [0, 1].map((weight) =>
  toEvaluations({
    config: {
      rules: rules.map((rule, index) =>
        index === 0 ? { ...rule, weight } : rule,
      ),
    },
  }),
);

const alternate = (variants: Evaluations[]) => {
  let index = 0;

  return {
    read: () => variants[index % variants.length] ?? {},
    next: () => {
      index += 1;
    },
  };
};

const createCounter = () => {
  let count = 0;

  return () => {
    count += 1;

    return count;
  };
};

const hundredValues = booleanValues(100, true);
const thousandValues = booleanValues(1000, true);

const courier = await start(courierFlags, () => courierValues, 2);
const hundred = await start(booleanFlags(100), () => hundredValues);
const thousand = await start(booleanFlags(1000), () => thousandValues);
const config = await start(configFlags, () => configValues[0] ?? {});
const toggled = alternate([thousandValues, booleanValues(1000, false)]);
const changing = await start(booleanFlags(1000), toggled.read, 1);
const edited = alternate(configValues);
const editedConfig = await start(configFlags, edited.read, 1);
const switchValues = [hundredValues, booleanValues(100, false)];

const switching = await start(
  booleanFlags(100),
  ({ version }) => switchValues[version % 2] ?? {},
);

const nextVersion = createCounter();

describe("refresh, nothing changed", () => {
  bench("8 flags, 2 listeners each", () => courier.refresh());
  bench("100 boolean flags", () => hundred.refresh());
  bench("1000 boolean flags", () => thousand.refresh());
  bench("one 33 KB config flag", () => config.refresh());
});

describe("refresh, values changed", () => {
  bench("1000 boolean flags, 1 listener each", () => {
    toggled.next();

    return changing.refresh();
  });

  bench("one 33 KB config flag, one rule edited", () => {
    edited.next();

    return editedConfig.refresh();
  });
});

describe("context switch", () => {
  bench("100 boolean flags", () =>
    switching.context({ version: nextVersion() }),
  );
});
