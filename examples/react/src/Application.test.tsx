import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { createProviderHosts } from "examples/shared/courier/providers/createProviderHosts";
import { Application } from "src/Application";

class IntersectionObserverStub {
  observe() {}

  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderApplication = () => {
  const backend = createFlagBackend({ latency: 0 });

  render(
    <Application backend={backend} getHost={createProviderHosts(backend)} />,
  );

  const banner = screen
    .getByRole("heading", { level: 1, name: "Courier" })
    .closest("header");

  if (banner === null) {
    throw new Error("Expected the page header.");
  }

  return { banner, app: screen.getByRole("region", { name: "Courier" }) };
};

test("resolves the signed-in workspace and follows a workspace switch", async () => {
  const { banner, app } = renderApplication();

  await waitFor(() => expect(within(banner).getByText("Ready")).toBeTruthy());
  expect(within(app).getByText("New composer")).toBeTruthy();
  fireEvent.click(within(app).getByRole("button", { name: /Acme Logistics/ }));
  await waitFor(() =>
    expect(within(app).getByText("Classic composer")).toBeTruthy(),
  );
});

test("a provider switch replaces the runtime and keeps the workspace", async () => {
  const { banner, app } = renderApplication();

  await waitFor(() => expect(within(banner).getByText("Ready")).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: /^Memory/ }));
  await waitFor(() => expect(within(banner).getByText("Memory")).toBeTruthy());
  await waitFor(() => expect(within(banner).getByText("Ready")).toBeTruthy());
  expect(within(app).getByText("New composer")).toBeTruthy();
});
