<script lang="ts">
  import { getPrism } from "src/context/getPrism";
  import { flagDetailsStore } from "src/stores/flagDetailsStore";
  import { flagStore } from "src/stores/flagStore";
  import { prismStatusStore } from "src/stores/prismStatusStore";

  const limit = flagStore("limit");
  const enabled = flagStore("enabled", (value) => value === true);
  const details = flagDetailsStore("limit");
  const phase = prismStatusStore((status) => status.state);
  const flags = getPrism();
</script>

<output data-started={flags.status.get().state !== "idle"}>
  {JSON.stringify($limit)}:{$enabled}:{$details.resolution}:{$phase}
</output>
