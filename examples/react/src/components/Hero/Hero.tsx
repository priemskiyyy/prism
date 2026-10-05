import type React from "react";
import { Lightning, Plugs } from "@phosphor-icons/react";
import { COURIER_FLAG_KEYS } from "examples/shared/courier/constants/courierFlagKeys";
import { PROVIDER_IDS } from "examples/shared/courier/constants/providerIds";
import { WORKSPACES } from "examples/shared/courier/constants/workspaces";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { HeroStat } from "src/components/Hero/HeroStat";
import { scrollToElement } from "src/utils/scrollToElement";

export const Hero: React.FunctionComponent = () => (
  <section
    aria-label="Overview"
    className="flex flex-col gap-6 rounded-3xl border border-indigo-200 bg-indigo-50 p-6 sm:p-10 dark:border-indigo-900/60 dark:bg-indigo-950/20"
  >
    <div className="flex flex-col gap-2">
      <p className="font-mono text-sm font-semibold tracking-widest text-indigo-700 uppercase dark:text-indigo-300">
        A Prism demo
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
        Feature flags for a multi-workspace app
      </h2>
      <p className="max-w-3xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
        Courier is a customer inbox where every workspace has its own plan,
        region and roles, and typed flags decide what each person sees. Switch
        workspace, swap the provider or break the flag service: every value
        stays valid and the page updates in one batch.
      </p>
    </div>
    <dl className="grid max-w-lg grid-cols-3 gap-3">
      <HeroStat label="Flags" value={COURIER_FLAG_KEYS.length} />
      <HeroStat label="Providers" value={PROVIDER_IDS.length} />
      <HeroStat label="Workspaces" value={Object.keys(WORKSPACES).length} />
    </dl>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => scrollToElement("lab")}
        className={buttonStyles({ variant: "primary" })}
      >
        <Lightning aria-hidden="true" size={16} weight="bold" />
        Break the flag service
      </button>
      <button
        type="button"
        onClick={() => scrollToElement("providers")}
        className={buttonStyles({ variant: "ghost" })}
      >
        <Plugs aria-hidden="true" size={16} weight="bold" />
        Swap the provider
      </button>
    </div>
  </section>
);
