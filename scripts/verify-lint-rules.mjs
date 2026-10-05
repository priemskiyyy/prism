import assert from "node:assert/strict";
import { ESLint } from "eslint";

const eslint = new ESLint();

const probes = [
  ['import { value } from "./value";', "no-restricted-syntax"],
  ['import type { Value } from "../types";', "no-restricted-syntax"],
  ['const value = import("./value");', "no-restricted-syntax"],
  ['type Value = import("../value").Value;', "no-restricted-syntax"],
  [
    'export { value } from "./value";',
    "no-restricted-syntax",
    "packages/core/src/index.ts",
  ],
  [
    "function value(flag) { if (flag) { return 1; } else { return 2; } }",
    "no-else-return",
  ],
  ["enum State { Ready }", "no-restricted-syntax"],
  ["switch (1) { default: break; }", "no-restricted-syntax"],
  ["void Promise.resolve();", "no-restricted-syntax"],
  ["let value = 0; value ||= 1;", "no-restricted-syntax"],
  ["let value = 0; value &&= 1;", "no-restricted-syntax"],
  ["let value; value ??= 1;", "no-restricted-syntax"],
  ["type Value = { readonly key: string };", "no-restricted-syntax"],
  ["type Value = { readonly [key: string]: string };", "no-restricted-syntax"],
  ["class Value { readonly key = 1; }", "no-restricted-syntax"],
  [
    "class Value { constructor(readonly key: string) {} }",
    "no-restricted-syntax",
  ],
  [
    "type Value<T> = { readonly [K in keyof T]: T[K] };",
    "no-restricted-syntax",
  ],
  ["type Value = readonly string[];", "no-restricted-syntax"],
  ["type Value = Readonly<{ key: string }>;", "no-restricted-syntax"],
  ["type Value = ReadonlyArray<string>;", "no-restricted-syntax"],
  ["type Value = DeepReadonly<{ key: string }>;", "no-restricted-syntax"],
  ['export * from "./value.js";', "no-restricted-syntax"],
  ['export { value } from "./value.js";', "no-restricted-syntax"],
  [
    "interface Value { key: string }",
    "@typescript-eslint/consistent-type-definitions",
  ],
  ["const value: any = 1;", "@typescript-eslint/no-explicit-any"],
  [
    "const value = 1 as number;",
    "@typescript-eslint/consistent-type-assertions",
  ],
  ["const value = [1] as const;", "no-restricted-syntax"],
  [
    "declare const signal: AbortSignal; signal.throwIfAborted();",
    "no-restricted-syntax",
  ],
  [
    "declare const signal: AbortSignal; const reason: unknown = signal.reason;",
    "no-restricted-syntax",
  ],
  ["const value = <number>1;", "no-restricted-syntax"],
  ["const value: string | null = null; value!;", "no-restricted-syntax"],
  ["if (true) console.log(1);", "curly"],
  [
    "function value() {\n  const value = 1;\n  if (value) {\n    console.log(value);\n  }\n}",
    "padding-line-between-statements",
  ],
  [
    "function value() {\n  console.log(1);\n  const next = 1;\n\n  console.log(next);\n}",
    "padding-line-between-statements",
  ],
  [
    "function value() {\n  console.log(1);\n  return 1;\n}",
    "padding-line-between-statements",
  ],
];

for (const [
  code,
  rule,
  filePath = "packages/core/src/lint-probe.ts",
] of probes) {
  const results = await eslint.lintText(code, {
    filePath,
  });

  assert(
    results.some((result) =>
      result.messages.some((message) => message.ruleId === rule),
    ),
    `Missing lint rejection: ${rule}: ${code}`,
  );
}

const componentProbes = probes.filter(([code]) => !code.startsWith("export"));

for (const extension of ["vue", "svelte"]) {
  for (const [code, rule] of componentProbes) {
    const results = await eslint.lintText(
      `<script lang="ts">\n${code}\n</script>`,
      { filePath: `examples/${extension}/src/LintProbe.${extension}` },
    );

    assert(
      results.some((result) =>
        result.messages.some((message) => message.ruleId === rule),
      ),
      `Missing ${extension} script rejection: ${rule}: ${code}`,
    );
  }
}

console.log(
  `Verified ${probes.length} syntax restrictions and ${componentProbes.length * 2} framework-script probes.`,
);
