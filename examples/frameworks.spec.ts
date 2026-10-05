import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const PORTS = [
  { name: "Vue", url: "http://127.0.0.1:4291/" },
  { name: "Solid", url: "http://127.0.0.1:4292/" },
  { name: "Svelte", url: "http://127.0.0.1:4293/" },
];

const open = async (page: Page, url: string, width: number) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url);
  await expect(
    page.getByRole("banner").getByText("Ready", { exact: true }),
  ).toBeVisible();

  return errors;
};

const app = (page: Page) =>
  page.getByRole("region", { name: "Courier", exact: true });

for (const { name, url } of PORTS) {
  test(`${name} follows a workspace switch and hides the markers`, async ({
    page,
  }) => {
    const errors = await open(page, url, 1280);

    await expect(
      app(page).getByText("New composer", { exact: true }),
    ).toBeVisible();
    await app(page)
      .getByRole("button", { name: /Acme Logistics/ })
      .click();
    await expect(
      app(page).getByText("Classic composer", { exact: true }),
    ).toBeVisible();
    await expect(
      app(page)
        .getByRole("group", { name: "Channels", exact: true })
        .getByRole("button", { name: /^Email/ }),
    ).toBeEnabled();
    await expect(
      app(page).getByText("channels", { exact: true }),
    ).toBeVisible();
    await app(page).getByRole("switch", { name: "Flag markers" }).click();
    await expect(app(page).getByText("channels", { exact: true })).toHaveCount(
      0,
    );
    expect(errors).toEqual([]);
  });

  test(`${name} fits a phone without horizontal scroll`, async ({ page }) => {
    const errors = await open(page, url, 375);

    await expect(
      app(page).getByRole("region", { name: "Contacts", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
    expect(errors).toEqual([]);
  });
}
