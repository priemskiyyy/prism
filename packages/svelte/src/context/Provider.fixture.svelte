<script lang="ts">
  import { setPrism } from "src/context/setPrism";
  import Probe from "src/context/Probe.fixture.svelte";
  import type { RegisteredPrism } from "src/types/Register";

  let { flags }: { flags: RegisteredPrism } = $props();

  setPrism(() => flags);
</script>

<Probe />
