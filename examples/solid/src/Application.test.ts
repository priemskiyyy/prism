import { fireEvent, waitFor, within } from "@testing-library/dom";
import { createComponent } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, expect, test } from "vitest";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { createMemoryHost } from "examples/shared/courier/providers/createMemoryHost";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import { Application } from "src/Application";

const disposals: (() => Promise<void>)[] = [];

afterEach(async () => {
  for (const dispose of disposals.splice(0)) {
    await dispose();
  }
});

const renderApplication = () => {
  const runtime = createCourierRuntime(
    createMemoryHost(createFlagBackend({ latency: 0 })),
    getCourierContext(INITIAL_MEMBERSHIP),
  );

  const root = document.createElement("div");

  document.body.append(root);

  const unmount = render(() => createComponent(Application, { runtime }), root);

  disposals.push(async () => {
    unmount();
    root.remove();
    await runtime.dispose();
  });

  return {
    runtime,
    unmount,
    app: within(root).getByRole("region", { name: "Courier" }),
  };
};

test("resolves the signed-in workspace and follows a workspace switch", async () => {
  const { runtime, app } = renderApplication();

  expect(within(app).getByText("Classic composer")).toBeTruthy();
  await runtime.start();
  await waitFor(() =>
    expect(within(app).getByText("New composer")).toBeTruthy(),
  );
  fireEvent.click(within(app).getByRole("button", { name: /Acme Logistics/ }));
  await waitFor(() =>
    expect(within(app).getByText("Classic composer")).toBeTruthy(),
  );
});

test("hides the flag markers without touching the flags", async () => {
  const { runtime, app } = renderApplication();

  await runtime.start();
  expect(within(app).getAllByText("channels").length).toBeGreaterThan(0);
  fireEvent.click(within(app).getByRole("switch", { name: "Flag markers" }));
  await waitFor(() => expect(within(app).queryByText("channels")).toBeNull());
  expect(runtime.flags.flag("channels").details.get().resolution).toBe(
    "resolved",
  );
});

test("unmounting leaves the runtime to the host", async () => {
  const { runtime, unmount } = renderApplication();

  await runtime.start();
  unmount();
  expect(runtime.flags.status.get().state).toBe("ready");
});
