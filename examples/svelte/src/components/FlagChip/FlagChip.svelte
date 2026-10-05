<script lang="ts">
  import { flagDetailsStore, getPrism } from "@priemskiyyy/prism-svelte";
  import type { RegisteredKey } from "@priemskiyyy/prism-svelte";
  import { ICONS } from "examples/shared/ui/constants/icons";
  import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
  import { dotStyles } from "examples/shared/ui/styles/dotStyles";
  import { FLAG_CHIP_CLASS_NAME } from "examples/shared/ui/styles/flagChipStyles";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";

  type Props = { flagKey: RegisteredKey };

  let { flagKey }: Props = $props();
  const flags = getPrism();
  const details = $derived(flagDetailsStore(flags.flag(flagKey)));
  const revision = $derived(
    `${$details.resolution}:${JSON.stringify($details.value)}`,
  );
</script>

{#key revision}
  <span
    title={`${flagKey} is ${$details.resolution}`}
    class={FLAG_CHIP_CLASS_NAME}
  >
    <BaseIcon src={ICONS.flag} size="small" />
    {flagKey}
    <span
      aria-hidden="true"
      class={dotStyles({ tone: RESOLUTION_TONES[$details.resolution] })}
    ></span>
  </span>
{/key}
