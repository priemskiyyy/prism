import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const WIDTHS = [375, 1280];

const PROVIDERS = [
  "Memory",
  "OpenFeature",
  "GrowthBook",
  "Unleash",
  "Statsig",
  "Your API",
];

const open = async (page: Page, width: number) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("banner").getByText("Ready", { exact: true }),
  ).toBeVisible();

  return errors;
};

const app = (page: Page) =>
  page.getByRole("region", { name: "Courier", exact: true });

const flagRow = (page: Page, key: string) =>
  page.getByRole("listitem", { name: key, exact: true });

const channelChip = (page: Page, channel: string) =>
  app(page)
    .getByRole("group", { name: "Channels", exact: true })
    .getByRole("button", { name: new RegExp(`^${channel}`) });

const lab = (page: Page) =>
  page.getByRole("region", { name: "Lab", exact: true });

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

for (const width of WIDTHS) {
  test(`resolves the workspace without errors or horizontal scroll at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors = await open(page, width);

    await expect(
      app(page).getByText("New composer", { exact: true }),
    ).toBeVisible();
    await expect(
      flagRow(page, "channels").getByText('["whatsapp","instagram"]'),
    ).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath("courier.png"),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });

  test(`switching workspace replaces every flag at ${width}px`, async ({
    page,
  }) => {
    const errors = await open(page, width);

    await app(page)
      .getByRole("button", { name: /Globex Health/ })
      .click();
    await expect(
      flagRow(page, "uploads").getByText("enterprise", { exact: true }),
    ).toBeVisible();
    await expect(
      app(page).getByText("Classic composer", { exact: true }),
    ).toBeVisible();
    await expect(channelChip(page, "Live chat")).toBeEnabled();
    expect(errors).toEqual([]);
  });
}

test("an override wins until the context changes", async ({ page }) => {
  const errors = await open(page, 1280);

  await app(page)
    .getByRole("button", { name: /Acme Logistics/ })
    .click();
  await expect(
    app(page).getByText("Classic composer", { exact: true }),
  ).toBeVisible();
  await flagRow(page, "composer")
    .getByRole("group", { name: "Override composer" })
    .getByRole("button", { name: "On", exact: true })
    .click();
  await expect(
    app(page).getByText("New composer", { exact: true }),
  ).toBeVisible();
  await expect(
    flagRow(page, "composer").getByText("override", { exact: true }),
  ).toBeVisible();
  await app(page)
    .getByRole("button", { name: /Northwind Café/ })
    .click();
  await expect(
    flagRow(page, "composer").getByText("resolved", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("an invalid override is rejected by the flag's schema", async ({
  page,
}) => {
  const errors = await open(page, 1280);
  const uploads = flagRow(page, "uploads");

  await uploads
    .getByRole("textbox", { name: "uploads override" })
    .fill('{ "maxFiles": 50, "maxMegabytes": 10 }');
  await uploads.getByRole("button", { name: "Override", exact: true }).click();
  await expect(uploads.getByRole("alert")).toContainText("maxFiles");
  await expect(uploads.getByText("resolved", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("a corrupt payload keeps the fallback and reports the error", async ({
  page,
}) => {
  const errors = await open(page, 1280);

  await lab(page)
    .getByRole("button", { name: "Corrupt channels", exact: true })
    .click();
  await expect(
    flagRow(page, "channels").getByText("error", { exact: true }),
  ).toBeVisible();
  await expect(channelChip(page, "Instagram")).toBeDisabled();
  await lab(page)
    .getByRole("button", { name: "Corrupt channels", exact: true })
    .click();
  await expect(channelChip(page, "Instagram")).toBeEnabled();
  expect(errors).toEqual([]);
});

test("an outage keeps every value while the status turns red", async ({
  page,
}) => {
  const errors = await open(page, 1280);
  const banner = page.getByRole("banner");

  await lab(page).getByRole("button", { name: "Offline", exact: true }).click();
  await lab(page)
    .getByRole("button", { name: "Refresh now", exact: true })
    .click();
  await expect(banner.getByText("Error", { exact: true })).toBeVisible();
  await expect(
    app(page).getByText("New composer", { exact: true }),
  ).toBeVisible();
  await lab(page).getByRole("button", { name: "Offline", exact: true }).click();
  await expect(banner.getByText("Ready", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("latency shows fallbacks until the new context resolves", async ({
  page,
}) => {
  const errors = await open(page, 1280);

  await lab(page).getByRole("button", { name: "1.5 s", exact: true }).click();
  await app(page)
    .getByRole("button", { name: /Globex Health/ })
    .click();
  await expect(
    flagRow(page, "uploads").getByText("pending", { exact: true }),
  ).toBeVisible();
  await expect(
    flagRow(page, "uploads").getByText("resolved", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("every provider serves the same workspace", async ({ page }) => {
  const errors = await open(page, 1280);
  const providers = page.getByRole("list", { name: "Providers" });

  for (const provider of PROVIDERS) {
    await providers
      .getByRole("button", { name: new RegExp(`^${provider}`) })
      .click();
    await expect(
      page.getByRole("banner").getByText(provider, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("banner").getByText("Ready", { exact: true }),
    ).toBeVisible();
    await expect(
      flagRow(page, "channels").getByText('["whatsapp","instagram"]'),
    ).toBeVisible();
    await expect(
      app(page).getByText("New composer", { exact: true }),
    ).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test("the devtools inspect and override the running flags", async ({
  page,
}) => {
  const errors = await open(page, 1280);

  await page
    .getByRole("button", { name: "Open Prism devtools", exact: true })
    .click();

  const devtools = page.getByRole("region", {
    name: "Prism devtools",
    exact: true,
  });

  const composer = devtools
    .getByRole("list", { name: "Flags", exact: true })
    .getByRole("listitem", { name: "composer", exact: true });

  await expect(devtools.getByText("ready", { exact: true })).toBeVisible();
  await composer.getByRole("button", { name: /^composer/ }).click();
  await composer
    .getByRole("textbox", { name: "composer override" })
    .fill("false");
  await composer.getByRole("button", { name: "Override", exact: true }).click();
  await expect(
    app(page).getByText("Classic composer", { exact: true }),
  ).toBeVisible();
  await devtools
    .getByRole("button", { name: "Release overrides", exact: true })
    .click();
  await expect(
    app(page).getByText("New composer", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("the devtools panel resizes from its free edge", async ({ page }) => {
  const errors = await open(page, 1280);

  await page
    .getByRole("button", { name: "Open Prism devtools", exact: true })
    .click();

  const devtools = page.getByRole("region", {
    name: "Prism devtools",
    exact: true,
  });

  const handle = devtools.getByRole("separator", { name: "Resize devtools" });
  const before = await devtools.boundingBox();
  const grip = await handle.boundingBox();

  if (before === null || grip === null) {
    throw new Error("Expected the devtools panel to be visible.");
  }

  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, grip.y - 120, { steps: 6 });
  await page.mouse.up();

  const after = await devtools.boundingBox();

  expect(after?.height).toBeGreaterThan(before.height + 100);
  expect(errors).toEqual([]);
});
