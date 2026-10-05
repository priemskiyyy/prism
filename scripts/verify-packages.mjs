import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { publint } from "publint";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const artifacts = join(root, ".artifacts");

await mkdir(artifacts, { recursive: true });

const directory = await mkdtemp(join(artifacts, "package-check-"));

const packages = [
  ...(await readdir(join(root, "packages"), { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !["adapters", "integrations"].includes(entry.name),
    )
    .map((entry) => entry.name),
  ...(await readdir(join(root, "packages/adapters"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => `adapters/${entry.name}`),
  ...(
    await readdir(join(root, "packages/integrations"), { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => `integrations/${entry.name}`),
];

const rootManifest = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);

const manifests = await Promise.all(
  packages.map(async (name) => ({
    directory: name,
    manifest: JSON.parse(
      await readFile(join(root, "packages", name, "package.json"), "utf8"),
    ),
  })),
);

const workspaceNames = new Set(manifests.map(({ manifest }) => manifest.name));

const exactVersion = (name) => {
  const versions = [rootManifest, ...manifests.map(({ manifest }) => manifest)]
    .map((manifest) => manifest.devDependencies?.[name])
    .filter(
      (version) =>
        typeof version === "string" &&
        /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/u.test(version),
    );

  assert(versions.length, `No exact development version available for ${name}`);
  assert(
    new Set(versions).size === 1,
    `Conflicting development versions for ${name}: ${versions.join(", ")}`,
  );

  return versions[0];
};

const dependencies = Object.fromEntries(
  [
    "@types/react",
    "@types/node",
    "typescript",
    "vitest",
    "react-native",
    "@openfeature/core",
    "zod",
  ].map((name) => [name, exactVersion(name)]),
);

const exportsToCheck = [];

for (const { manifest } of manifests) {
  for (const name of Object.keys(manifest.peerDependencies ?? {})) {
    if (!workspaceNames.has(name)) {
      dependencies[name] = exactVersion(name);
    }
  }

  for (const subpath of Object.keys(manifest.exports)) {
    exportsToCheck.push(
      subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`,
    );
  }
}

for (const name of packages) {
  const pkgDir = join(root, "packages", name);

  const manifest = JSON.parse(
    await readFile(join(pkgDir, "package.json"), "utf8"),
  );

  for (const file of await readdir(join(pkgDir, "dist"))) {
    if (!file.endsWith(".js") && !file.endsWith(".d.ts")) {
      continue;
    }

    const source = await readFile(join(pkgDir, "dist", file), "utf8");

    assert(
      !/\b(?:import|from)\s*(?:\(\s*)?["'](?:src|adapters|examples)\//u.test(
        source,
      ),
      `${manifest.name}/${file} leaks a source alias into the published package`,
    );
  }

  const result = await publint({ pkgDir });

  assert.deepEqual(
    result.messages,
    [],
    `publint failed for ${manifest.name}: ${JSON.stringify(result.messages)}`,
  );
  execFileSync("pnpm", ["pack", "--pack-destination", directory], {
    cwd: pkgDir,
    stdio: "pipe",
  });

  const tarball = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;

  dependencies[manifest.name] = `file:./${tarball}`;

  const contents = execFileSync("tar", ["-tf", join(directory, tarball)], {
    encoding: "utf8",
  });

  assert(
    !/\.test\.|\.contracts\.|package\/src\//u.test(contents),
    `${manifest.name} ships private source or tests`,
  );
  assert(
    contents.includes("package/LICENSE"),
    `${manifest.name} is missing its license`,
  );
  assert(
    contents.includes("package/README.md"),
    `${manifest.name} is missing its README`,
  );

  for (const entry of Object.values(manifest.exports)) {
    assert(
      contents.includes(`package/${entry.import.slice(2)}`),
      `Missing export ${entry.import}`,
    );
    assert(
      contents.includes(`package/${entry.types.slice(2)}`),
      `Missing declaration ${entry.types}`,
    );
  }
}

await writeFile(
  join(directory, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies }, null, 2),
);
execFileSync(
  "pnpm",
  [
    "install",
    "--prefer-offline",
    "--ignore-workspace",
    "--ignore-scripts",
    "--config.auto-install-peers=false",
  ],
  { cwd: directory, stdio: "inherit" },
);

const testingEntry = "@priemskiyyy/prism/testing";

await writeFile(
  join(directory, "imports.mjs"),
  `
import assert from "node:assert/strict";
for (const specifier of ${JSON.stringify(exportsToCheck.filter((entry) => entry !== testingEntry))}) {
  const namespace = await import(specifier);
  assert(Object.keys(namespace).length > 0, specifier + " has no public runtime exports");
  for (const [name, value] of Object.entries(namespace)) {
    assert.notEqual(value, undefined, specifier + "/" + name + " is undefined");
  }
}
`,
);
await writeFile(
  join(directory, "imports.test.ts"),
  `
import { expect, test } from "vitest";
import { testFlagAdapter } from "${testingEntry}";
test("imports the public conformance helper inside Vitest", () => {
  expect(testFlagAdapter).toBeTypeOf("function");
});
`,
);
await writeFile(
  join(directory, "vitest.config.mjs"),
  `export default { test: { include: ["imports.test.ts"], environment: "node" } };`,
);

const sharedConsumer = `
import { z } from "zod";
import { Prism, flag } from "@priemskiyyy/prism";
import type { FlagAdapter } from "@priemskiyyy/prism";
import { memory } from "@priemskiyyy/prism-memory";
import { PrismProvider, useFlag, useFlagDetails, usePrism, usePrismStatus } from "@priemskiyyy/prism-react";
import type { RegisteredKey, PrismProviderProps } from "@priemskiyyy/prism-react";
import { PrismProvider as VueProvider, useFlag as useVueFlag, useFlagDetails as useVueDetails, usePrism as useVuePrism, usePrismStatus as useVueStatus } from "@priemskiyyy/prism-vue";
import { PrismProvider as SolidProvider, useFlag as useSolidFlag, useFlagDetails as useSolidDetails, usePrism as useSolidPrism, usePrismStatus as useSolidStatus } from "@priemskiyyy/prism-solid";
import { flagStore, flagDetailsStore, getPrism, setPrism, prismStatusStore } from "@priemskiyyy/prism-svelte";
import type { Readable } from "svelte/store";
import { http } from "@priemskiyyy/prism-http";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { testFlagAdapter } from "@priemskiyyy/prism/testing";
import { configcat } from "@priemskiyyy/prism-configcat";
import { statsig } from "@priemskiyyy/prism-statsig";
import { posthog } from "@priemskiyyy/prism-posthog";
import { openFeature } from "@priemskiyyy/prism-openfeature";
import { openFeature as openFeatureWeb } from "@priemskiyyy/prism-openfeature-web";
import { growthbook } from "@priemskiyyy/prism-growthbook";
import { unleash } from "@priemskiyyy/prism-unleash";
import { simulcastUpdates } from "@priemskiyyy/prism-simulcast";
import type { IConfigCatClient } from "@configcat/sdk";
import type { StatsigClient } from "@statsig/js-client";
import type { PostHog } from "posthog-js";
import type { Client } from "@openfeature/server-sdk";
import type { Client as WebClient } from "@openfeature/web-sdk";
import type { GrowthBook } from "@growthbook/growthbook";
import type { UnleashClient } from "unleash-proxy-client";

type Context = { account: string };
declare const configcatClient: IConfigCatClient;
declare const statsigClient: StatsigClient;
declare const posthogClient: PostHog;
declare const openfeatureClient: Client;
declare const openfeatureWebClient: WebClient;
declare const growthbookClient: GrowthBook;
declare const unleashClient: UnleashClient;
const configcatAdapter: FlagAdapter<Context> = configcat({
  client: configcatClient,
  user: (context: Context) => ({ identifier: context.account }),
});
const statsigAdapter: FlagAdapter<Context> = statsig({
  client: statsigClient,
  user: (context: Context) => ({ userID: context.account }),
  resources: { enabled: { type: "gate", name: "enabled" } },
});
const posthogAdapter: FlagAdapter<Context> = posthog({
  client: posthogClient,
  userId: (context: Context) => context.account,
  resources: { enabled: { flag: "enabled", select: "enabled" } },
});
const openfeatureAdapter: FlagAdapter<Context> = openFeature<Context>({ client: openfeatureClient, context: (context: Context) => ({ targetingKey: context.account }) });
const openfeatureWebAdapter: FlagAdapter<Context> = openFeatureWeb<Context>({ client: openfeatureWebClient, context: (context: Context) => ({ targetingKey: context.account }) });
const growthbookAdapter: FlagAdapter<Context> = growthbook({ client: growthbookClient, attributes: (context: Context) => ({ id: context.account }) });
const unleashAdapter: FlagAdapter<Context> = unleash({ client: unleashClient, context: (context: Context) => ({ userId: context.account }), resources: { enabled: { toggle: "enabled", select: "enabled" } } });
// @ts-expect-error Every SDK adapter requires an existing client.
statsig({ user: (context: Context) => ({ userID: context.account }), resources: {} });
export { configcatAdapter, statsigAdapter, posthogAdapter, openfeatureAdapter, openfeatureWebAdapter, growthbookAdapter, unleashAdapter, simulcastUpdates };
const flags = new Prism({ flags: { enabled: flag(z.boolean(), { fallback: false }), count: flag(z.number(), { fallback: 3 }) }, adapter: memory({ values: () => ({ enabled: true }) }) });
const enabled: boolean = flags.flag("enabled").get();
const count: number = flags.flag("count").get();
// @ts-expect-error Keys are inferred from declarations.
flags.flag("undeclared");
// @ts-expect-error Primitive flag values cannot be caller-selected.
const wrong: string = flags.flag("enabled").get();
const useEnabled = () => useFlag(flags.flag("enabled"));
const vueBindings = () => {
  const value: boolean = useVueFlag(flags.flag("enabled")).value;
  const details: boolean = useVueDetails(flags.flag("enabled")).value.value;
  const refreshing: boolean = useVueStatus(flags).value.refreshing;
  return { value, details, refreshing };
};
const solidBindings = () => {
  const value: boolean = useSolidFlag(() => flags.flag("enabled"))();
  const details: boolean = useSolidDetails(flags.flag("enabled"))().value;
  const refreshing: boolean = useSolidStatus(() => flags)().refreshing;
  return { value, details, refreshing };
};
export { vueBindings, solidBindings };
const enabledStore: Readable<boolean> = flagStore(flags.flag("enabled"));
const selectedStore: Readable<string> = flagStore(flags.flag("enabled"), value => value ? "yes" : "no");
const detailsStore = flagDetailsStore(flags.flag("enabled"), value => value.resolution);
const statusStore: Readable<boolean> = prismStatusStore(flags, value => value.refreshing);
// @ts-expect-error Selectors retain the declared handle value type.
flagStore(flags.flag("enabled"), (value: string) => value.length);
export { enabledStore, selectedStore, detailsStore, statusStore };
export { enabled, count, useEnabled, http, createMockAdapter, testFlagAdapter };
declare module "@priemskiyyy/prism-react" { interface Register { prism: typeof flags; } }
declare module "@priemskiyyy/prism-vue" { interface Register { prism: typeof flags; } }
declare module "@priemskiyyy/prism-solid" { interface Register { prism: typeof flags; } }
declare module "@priemskiyyy/prism-svelte" { interface Register { prism: typeof flags; } }
const registeredKey: RegisteredKey = "count";
// @ts-expect-error Registered keys come from the registered Prism.
const unregisteredKey: RegisteredKey = "undeclared";
const providerProps: PrismProviderProps = { flags, children: null };
const reactKeys = () => {
  const value: boolean = useFlag("enabled");
  const doubled: number = useFlag("count", (current) => current * 2);
  const resolution = useFlagDetails("count", (details) => details.resolution);
  const refreshing: boolean = usePrismStatus((status) => status.refreshing);
  const provided: typeof flags = usePrism();
  // @ts-expect-error Keys are inferred from the registered declarations.
  useFlag("undeclared");
  // @ts-expect-error The registered key fixes the value type.
  const wrongValue: string = useFlag("enabled");
  return { value, doubled, resolution, refreshing, provided, wrongValue, PrismProvider };
};
const vueKeys = () => {
  const value: boolean = useVueFlag("enabled").value;
  const getter: boolean = useVueFlag(() => "enabled").value;
  const details: number = useVueDetails("count").value.value;
  const refreshing: boolean = useVueStatus().value.refreshing;
  const provided: typeof flags = useVuePrism().value;
  // @ts-expect-error Keys are inferred from the registered declarations.
  useVueFlag("undeclared");
  return { value, getter, details, refreshing, provided, VueProvider };
};
const solidKeys = () => {
  const value: boolean = useSolidFlag("enabled")();
  const details: number = useSolidDetails(() => "count")().value;
  const refreshing: boolean = useSolidStatus()().refreshing;
  const provided: typeof flags = useSolidPrism()();
  // @ts-expect-error Keys are inferred from the registered declarations.
  useSolidFlag("undeclared");
  return { value, details, refreshing, provided, SolidProvider };
};
const svelteKeys = () => {
  setPrism(() => flags);
  const value: Readable<boolean> = flagStore("enabled");
  const doubled: Readable<number> = flagStore("count", (current) => current * 2);
  const details = flagDetailsStore("count", (current) => current.value);
  const refreshing: Readable<boolean> = prismStatusStore((status) => status.refreshing);
  const provided: typeof flags = getPrism();
  // @ts-expect-error Keys are inferred from the registered declarations.
  flagStore("undeclared");
  return { value, doubled, details, refreshing, provided };
};
export { registeredKey, unregisteredKey, providerProps, reactKeys, vueKeys, solidKeys, svelteKeys };
`;

const launchdarklyConsumer = `
import { launchdarkly as launchdarklyWeb } from "@priemskiyyy/prism-launchdarkly-web";
import { launchdarkly as launchdarklyNative } from "@priemskiyyy/prism-launchdarkly-react-native";
import type { LDClient } from "@launchdarkly/js-client-sdk";
import type { ReactNativeLDClient } from "@launchdarkly/react-native-client-sdk";
declare const webClient: LDClient;
declare const nativeClient: ReactNativeLDClient;
const web: FlagAdapter<Context> = launchdarklyWeb({
  client: webClient,
  context: (context: Context) => ({ kind: "user", key: context.account }),
});
const native: FlagAdapter<Context> = launchdarklyNative({
  client: nativeClient,
  context: (context: Context) => ({ kind: "user", key: context.account }),
});
// @ts-expect-error A client is required.
launchdarklyNative({ context: (context: Context) => ({ kind: "user", key: context.account }) });

export { web, native };
`;

await writeFile(
  join(directory, "sdk-consumer.ts"),
  `${sharedConsumer}\n${launchdarklyConsumer}`,
);
await writeFile(
  join(directory, "consumer.ts"),
  `${sharedConsumer}
${exportsToCheck.map((entry, index) => `import * as entry${index} from ${JSON.stringify(entry)};`).join("\n")}
export { ${exportsToCheck.map((_entry, index) => `entry${index}`).join(", ")} };
`,
);
execFileSync(process.execPath, ["imports.mjs"], {
  cwd: directory,
  stdio: "inherit",
});
execFileSync(
  "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.config.mjs"],
  {
    cwd: directory,
    stdio: "inherit",
  },
);

for (const [file, module, resolution] of [
  ["consumer.ts", "NodeNext", "NodeNext"],
  ["sdk-consumer.ts", "ESNext", "Bundler"],
]) {
  execFileSync(
    "pnpm",
    [
      "exec",
      "tsc",
      "--strict",
      "--noUncheckedIndexedAccess",
      "--exactOptionalPropertyTypes",
      "--module",
      module,
      "--moduleResolution",
      resolution,
      "--target",
      "ES2022",
      "--skipLibCheck",
      "--noEmit",
      file,
    ],
    { cwd: directory, stdio: "inherit" },
  );

  const program = ts.createProgram([join(directory, file)], {
    strict: true,
    noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true,
    module:
      module === "NodeNext" ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
    moduleResolution:
      resolution === "NodeNext"
        ? ts.ModuleResolutionKind.NodeNext
        : ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: false,
    noEmit: true,
    types: [],
  });

  const declarationFiles = program
    .getSourceFiles()
    .filter((source) =>
      /[/\\]@priemskiyyy[/\\]prism(?:-[^/\\]+)?[/\\]dist[/\\].+\.d\.ts$/u.test(
        source.fileName,
      ),
    );

  assert(
    declarationFiles.length >= packages.length,
    "A packed declaration entry was not loaded",
  );

  const declarationErrors = declarationFiles.flatMap((source) => [
    ...program.getSyntacticDiagnostics(source),
    ...program.getSemanticDiagnostics(source),
  ]);

  assert.equal(
    declarationErrors.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(declarationErrors, {
      getCanonicalFileName: (name) => name,
      getCurrentDirectory: () => directory,
      getNewLine: () => "\n",
    }),
  );
}

const coreFiles = await readdir(join(root, "packages/core/dist"));

const coreMain = await readFile(
  join(root, "packages/core/dist/index.js"),
  "utf8",
);

assert(
  !/from ["'](?:react|@priemskiyyy\/simulcast|vitest)["']/u.test(coreMain),
  "Core main entry leaks an optional dependency",
);
assert(coreFiles.includes("mock.js") && coreFiles.includes("testing.js"));
console.log(
  `Verified ${packages.length} packed ESM packages, all public entry imports, SDK peer compatibility, and emitted public declarations.`,
);
