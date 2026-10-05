import { fireEvent, waitFor, within } from "@testing-library/dom";
import { mount, unmount } from "svelte";
import { afterEach, expect, test } from "vitest";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { createMemoryHost } from "examples/shared/courier/providers/createMemoryHost";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import Application from "src/Application.svelte";

const disposals: (() => Promise<void>)[] = [];

afterEach(async () => {
  for (const dispose of disposals.splice(0)) {
    await dispose();
  }
});

const mountApplication = () => {
  const runtime = createCourierRuntime(
    createMemoryHost(createFlagBackend({ latency: 0 })),
    getCourierContext(INITIAL_MEMBERSHIP),
  );

  const target = document.createElement("div");

  document.body.append(target);

  const application = mount(Application, { target, props: { runtime } });

  disposals.push(async () => {
    await unmount(application);
    target.remove();
    await runtime.dispose();
  });

  return {
    runtime,
    application,
    app: within(target).getByRole("region", { name: "Courier" }),
  };
};

test("resolves the signed-in workspace and follows a workspace switch", async () => {
  const { runtime, app } = mountApplication();

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
  const { runtime, app } = mountApplication();

  await runtime.start();
  await waitFor(() =>
    expect(within(app).getAllByText("channels").length).toBeGreaterThan(0),
  );
  fireEvent.click(within(app).getByRole("switch", { name: "Flag markers" }));
  await waitFor(() => expect(within(app).queryByText("channels")).toBeNull());
  expect(runtime.flags.flag("channels").details.get().resolution).toBe(
    "resolved",
  );
});

test("unmounting leaves the runtime to the host", async () => {
  const { runtime, application } = mountApplication();

  await runtime.start();
  await unmount(application);
  expect(runtime.flags.status.get().state).toBe("ready");
});
