import { describe, expect, onTestFinished, test } from "vitest";
import type { DeclaredFlag } from "src/types/DeclaredFlag";
import type { Evaluations } from "src/types/Evaluations";
import type { FlagAdapter } from "src/types/FlagAdapter";

export type FlagAdapterFixture<C> = {
  adapter: FlagAdapter<C>;
  context: C;
  nextContext: C;
  flags: DeclaredFlag[];
  verify: (evaluations: Evaluations, context: C) => void;
  cleanup?: () => void | Promise<void>;
};

export type FlagAdapterConformanceOptions<C> = {
  name: string;
  create: () => FlagAdapterFixture<C> | Promise<FlagAdapterFixture<C>>;
};

export const testFlagAdapter = <C>({
  name,
  create,
}: FlagAdapterConformanceOptions<C>) => {
  const open = async () => {
    const fixture = await create();
    const session = fixture.adapter.open({ invalidate: () => {} });

    onTestFinished(async () => {
      await session.dispose();
      await fixture.cleanup?.();
    });

    const identifyAndRead = async (context: C) => {
      await session.identify(context);

      return session.read({
        context,
        flags: fixture.flags,
        signal: new AbortController().signal,
      });
    };

    return { ...fixture, session, identifyAndRead };
  };

  describe(`${name} adapter conformance`, () => {
    test("identifies and reads every requested context", async () => {
      const fixture = await open();

      expect(fixture.adapter.name.length).toBeGreaterThan(0);

      for (const context of [fixture.context, fixture.nextContext]) {
        fixture.verify(await fixture.identifyAndRead(context), context);
      }
    });

    test("disposes once and rejects identify and read afterwards", async () => {
      const fixture = await open();

      await fixture.identifyAndRead(fixture.context);

      const disposal = fixture.session.dispose();

      expect(fixture.session.dispose()).toBe(disposal);
      await disposal;
      await expect(
        fixture.identifyAndRead(fixture.context),
      ).rejects.toMatchObject({ code: "DISPOSED" });
    });
  });
};
