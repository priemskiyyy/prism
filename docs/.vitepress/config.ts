import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const siteUrl = process.env.DOCS_SITE_URL;

const repositoryUrl =
  process.env.DOCS_REPOSITORY_URL ?? "https://github.com/priemskiyyy/prism";

const base =
  process.env.DOCS_BASE_PATH ?? (siteUrl ? new URL(siteUrl).pathname : "/");

const description =
  "Typed, reactive feature flags for TypeScript. Declare every flag with a schema and a fallback, read it from React, Vue, Solid or Svelte, and keep the same code across OpenFeature, LaunchDarkly, GrowthBook, Unleash, Statsig, PostHog, ConfigCat or your own API.";

const writeLlmsText = async (srcDir: string, outDir: string) => {
  const origin = siteUrl ? siteUrl.replace(/\/$/, "") : base.replace(/\/$/, "");

  const files = (await readdir(srcDir, { recursive: true }))
    .filter((file) => file.endsWith(".md"))
    .filter((file) => !file.startsWith(".vitepress"))
    .filter((file) => file !== "README.md" && file !== "index.md")
    .sort();

  const pages = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(join(srcDir, file), "utf8");
      const title = source.match(/^# (.+)$/m)?.[1] ?? file;
      const summary = source.match(/^description: "(.+)"$/m)?.[1] ?? "";
      const url = `${origin}/${file.replace(/\.md$/, "")}`;

      return { title, summary, url, source };
    }),
  );

  const index = [
    "# Prism",
    "",
    `> ${description}`,
    "",
    "## Docs",
    "",
    ...pages.map(
      ({ title, summary, url }) => `- [${title}](${url}): ${summary}`,
    ),
    "",
  ].join("\n");

  const full = pages
    .map(({ url, source }) => `<!-- ${url} -->\n${source.trim()}`)
    .join("\n\n---\n\n");

  await writeFile(join(outDir, "llms.txt"), index);
  await writeFile(join(outDir, "llms-full.txt"), `${full}\n`);
};

export default defineConfig({
  base,
  lang: "en-US",
  title: "Prism",
  description,
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: `${base}favicon.svg` },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Prism" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "theme-color", content: "#4f46e5" }],
  ],
  ...(siteUrl ? { sitemap: { hostname: siteUrl } } : {}),
  vite: {
    resolve: {
      alias: { src: fileURLToPath(new URL(".", import.meta.url)) },
    },
  },
  buildEnd: async ({ outDir, srcDir }) => {
    const sitemap = siteUrl
      ? `Sitemap: ${new URL("sitemap.xml", `${siteUrl.replace(/\/$/, "")}/`).href}\n`
      : "";

    await writeFile(
      join(outDir, "robots.txt"),
      `User-agent: *\nAllow: /\n${sitemap}`,
    );
    await writeLlmsText(srcDir, outDir);
  },
  transformHead: ({ pageData }) => {
    const title =
      pageData.title === "Prism" ? "Prism" : `${pageData.title} | Prism`;

    const head: [string, Record<string, string>][] = [
      ["meta", { property: "og:title", content: title }],
      [
        "meta",
        {
          property: "og:description",
          content: pageData.description || description,
        },
      ],
      ["meta", { name: "twitter:title", content: title }],
      [
        "meta",
        {
          name: "twitter:description",
          content: pageData.description || description,
        },
      ],
    ];

    if (!siteUrl) {
      return head;
    }

    const pagePath = pageData.relativePath
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, "");

    const url = new URL(pagePath, `${siteUrl.replace(/\/$/, "")}/`).href;

    const image = new URL(
      "images/social-preview.png",
      `${siteUrl.replace(/\/$/, "")}/`,
    ).href;

    head.push(
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:image", content: image }],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "630" }],
      [
        "meta",
        {
          property: "og:image:alt",
          content: "Prism. Typed feature flags for TypeScript.",
        },
      ],
      ["meta", { name: "twitter:image", content: image }],
    );

    return head;
  },
  srcExclude: ["README.md"],
  ignoreDeadLinks: [/^\/demo\//],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: { src: "/favicon.svg", alt: "" },
    socialLinks: [{ icon: "github", link: repositoryUrl }],
    editLink: { pattern: `${repositoryUrl}/edit/main/docs/:path` },
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Providers", link: "/adapters" },
      {
        text: "Frameworks",
        items: [
          { text: "React", link: "/react" },
          { text: "Vue", link: "/vue" },
          { text: "Solid", link: "/solid" },
          { text: "Svelte", link: "/svelte" },
          { text: "React Native / Expo", link: "/react-native" },
        ],
      },
      { text: "API", link: "/api" },
      { text: "Examples", link: "/examples" },
    ],
    sidebar: [
      {
        text: "Start here",
        items: [
          { text: "Getting started", link: "/getting-started" },
          { text: "Installation", link: "/installation" },
          { text: "Example applications", link: "/examples" },
        ],
      },
      {
        text: "Flags",
        items: [
          { text: "Declaring flags", link: "/flags" },
          { text: "Schemas", link: "/schemas" },
          { text: "The runtime", link: "/runtime" },
          { text: "Context and identity", link: "/context" },
          { text: "Flag details", link: "/details" },
          { text: "Local overrides", link: "/overrides" },
          { text: "Live updates", link: "/updates" },
          { text: "Errors and recovery", link: "/errors" },
          { text: "TypeScript", link: "/typescript" },
        ],
      },
      {
        text: "Providers",
        items: [
          { text: "Choose a provider", link: "/adapters" },
          { text: "Your own API", link: "/adapters/http" },
          { text: "Memory", link: "/adapters/memory" },
          { text: "OpenFeature", link: "/adapters/openfeature" },
          { text: "LaunchDarkly", link: "/adapters/launchdarkly" },
          { text: "GrowthBook", link: "/adapters/growthbook" },
          { text: "Unleash", link: "/adapters/unleash" },
          { text: "Statsig", link: "/adapters/statsig" },
          { text: "PostHog", link: "/adapters/posthog" },
          { text: "ConfigCat", link: "/adapters/configcat" },
        ],
      },
      {
        text: "Frameworks",
        items: [
          { text: "React", link: "/react" },
          { text: "Vue", link: "/vue" },
          { text: "Solid", link: "/solid" },
          { text: "Svelte", link: "/svelte" },
          { text: "React Native and Expo", link: "/react-native" },
          { text: "Server rendering", link: "/server-rendering" },
        ],
      },
      {
        text: "Inspect and test",
        items: [
          { text: "Devtools", link: "/devtools" },
          { text: "Testing", link: "/testing" },
          { text: "Recipes", link: "/recipes" },
          { text: "Troubleshooting", link: "/troubleshooting" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "API reference", link: "/api" },
          { text: "Writing an adapter", link: "/writing-an-adapter" },
          { text: "Performance", link: "/performance" },
          { text: "Architecture", link: "/internals/architecture" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
    footer: { message: "Released under the MIT License." },
  },
});
