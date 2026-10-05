import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import svelte from "eslint-plugin-svelte";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

const bannedSyntax = [
  [
    "ImportDeclaration[source.value=/^[.]/]",
    "Use absolute source aliases or public package imports.",
  ],
  [
    "ExportNamedDeclaration[source.value=/^[.]/]",
    "Use absolute source aliases for public exports.",
  ],
  [
    "ImportExpression[source.value=/^[.]/]",
    "Use absolute source aliases for dynamic imports.",
  ],
  [
    "TSImportType[source.value=/^[.]/]",
    "Use absolute source aliases for imported types.",
  ],
  ["TSAsExpression", "Do not use type assertions, including as const."],
  ["TSTypeAssertion", "Do not use type assertions."],
  ["TSNonNullExpression", "Narrow nullable values before using them."],
  ["TSEnumDeclaration", "Use a string union instead of an enum."],
  ["SwitchStatement", "Use explicit conditional dispatch."],
  [
    "UnaryExpression[operator='void']",
    "Handle promise completion and failures explicitly.",
  ],
  ["AssignmentExpression[operator='??=']", "Use explicit assignment."],
  ["AssignmentExpression[operator='||=']", "Use explicit assignment."],
  ["AssignmentExpression[operator='&&=']", "Use explicit assignment."],
  ["TSPropertySignature[readonly=true]", "Use mutable public property types."],
  ["TSIndexSignature[readonly=true]", "Use mutable index signatures."],
  ["PropertyDefinition[readonly=true]", "Use mutable property types."],
  ["TSParameterProperty[readonly=true]", "Use mutable property types."],
  ["TSMappedType[readonly]", "Do not add readonly mapped modifiers."],
  ["TSTypeOperator[operator='readonly']", "Use mutable array types."],
  [
    "TSTypeReference[typeName.name=/^(Readonly|ReadonlyArray|DeepReadonly)$/]",
    "Do not use readonly utility types.",
  ],
  ["ExportAllDeclaration", "List public exports explicitly."],
  [
    "MemberExpression[property.name='throwIfAborted']",
    "React Native's AbortSignal has no throwIfAborted(): check signal.aborted.",
  ],
  [
    "MemberExpression[object.name='signal'][property.name='reason']",
    "React Native's AbortSignal has no reason: reject with an Error of your own.",
  ],
].map(([selector, message]) => ({ selector, message }));

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.expo/**",
      "**/node_modules/**",
      ".artifacts/**",
      "docs/.vitepress/cache/**",
      ".pnpm-store/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...svelte.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx,vue,svelte}"],
    rules: {
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: ["const", "let"] },
        { blankLine: "always", prev: ["const", "let"], next: "*" },
        {
          blankLine: "any",
          prev: ["singleline-const", "singleline-let"],
          next: ["singleline-const", "singleline-let"],
        },
        { blankLine: "always", prev: "*", next: "block-like" },
        { blankLine: "always", prev: "block-like", next: "*" },
        { blankLine: "always", prev: "*", next: "return" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,vue,svelte}"],
    rules: {
      curly: ["error", "all"],
      "no-else-return": ["error", { allowElseIf: false }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-syntax": ["error", ...bannedSyntax],
    },
  },
  {
    files: ["packages/**/src/**/*.{ts,tsx,vue,svelte}"],
    ignores: [
      "packages/*/src/index.ts",
      "packages/*/src/mock.ts",
      "packages/*/src/testing.ts",
      "packages/adapters/*/src/index.ts",
      "packages/integrations/*/src/index.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...bannedSyntax,
        {
          selector: "ExportNamedDeclaration[source]",
          message:
            "Keep explicit re-exports at public package entry points only.",
        },
      ],
    },
  },
  {
    files: [
      "packages/react/**/*.{ts,tsx}",
      "packages/devtools/src/react.tsx",
      "examples/react/**/*.{ts,tsx}",
      "examples/expo/**/*.{ts,tsx}",
    ],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": ["error", { ignores: ["Application"] }],
      // Prettier owns template layout, including compact inline elements.
      "vue/singleline-html-element-content-newline": "off",
      "vue/max-attributes-per-line": "off",
    },
  },
  {
    files: ["**/*.{vue,svelte}", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue", ".svelte"],
      },
    },
    rules: { "no-undef": "off" },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        fetch: "readonly",
        AbortSignal: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Buffer: "readonly",
      },
    },
  },
);
