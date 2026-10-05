import { expect, test } from "vitest";
import { createDemoServer } from "#src/createDemoServer";

const listen = async () => {
  const host = createDemoServer();

  await new Promise<void>((resolve, reject) => {
    host.server.once("error", reject);
    host.server.listen(0, "127.0.0.1", resolve);
  });

  const address = host.server.address();

  if (address === null || typeof address === "string") {
    throw new Error("Expected a TCP listener.");
  }

  return { ...host, origin: `http://127.0.0.1:${address.port}` };
};

const post = (origin: string, path: string, body: unknown) =>
  fetch(`${origin}/api/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const read = async (origin: string, userId: string, workspaceId: string) => {
  const response = await post(origin, "flags", {
    context: { userId, workspaceId },
    keys: ["new-composer", "contact-limit", "__proto__"],
  });

  const evaluations: unknown = await response.json();

  return evaluations;
};

test("answers the Courier flags of a membership and omits unknown keys", async () => {
  const host = await listen();

  try {
    expect(await read(host.origin, "alex", "northwind")).toEqual({
      "new-composer": { value: true, variant: "on" },
      "contact-limit": { value: 1000, variant: "starter" },
    });
    expect(await read(host.origin, "alex", "acme")).toMatchObject({
      "new-composer": { value: false },
      "contact-limit": { value: 25000 },
    });
  } finally {
    await host.dispose();
  }
});

test("a control change applies to the next read on its own server only", async () => {
  const first = await listen();
  const second = await listen();

  try {
    await post(first.origin, "control", { composerRollout: "EVERYONE" });
    expect(await read(first.origin, "alex", "acme")).toMatchObject({
      "new-composer": { value: true },
    });
    expect(await read(second.origin, "alex", "acme")).toMatchObject({
      "new-composer": { value: false },
    });
  } finally {
    await Promise.all([first.dispose(), second.dispose()]);
  }
});

test("rejects malformed controls and unknown memberships before answering", async () => {
  const host = await listen();

  try {
    expect(
      (await post(host.origin, "control", { offline: "yes" })).status,
    ).toBe(400);
    expect((await post(host.origin, "control", { latency: 250 })).status).toBe(
      400,
    );
    expect(
      (
        await post(host.origin, "flags", {
          context: { userId: "blake", workspaceId: "globex" },
          keys: ["new-composer"],
        })
      ).status,
    ).toBe(400);
  } finally {
    await host.dispose();
  }
});

test("an offline service answers 503 until it comes back", async () => {
  const host = await listen();

  try {
    await post(host.origin, "control", { offline: true });

    const offline = await post(host.origin, "flags", {
      context: { userId: "alex", workspaceId: "northwind" },
      keys: ["new-composer"],
    });

    expect(offline.status).toBe(503);
    await post(host.origin, "control", { offline: false });
    expect(await read(host.origin, "alex", "northwind")).toMatchObject({
      "new-composer": { value: true },
    });
  } finally {
    await host.dispose();
  }
});

test("an unstarted host has nothing to dispose", async () => {
  await expect(createDemoServer().dispose()).resolves.toBeUndefined();
});
