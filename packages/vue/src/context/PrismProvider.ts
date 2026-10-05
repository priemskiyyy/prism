import { computed, defineComponent, provide } from "vue";
import type { PropType } from "vue";
import type { RegisteredPrism } from "src/types/Register";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

export type PrismProviderProps = { flags: RegisteredPrism };

const flagsType: PropType<RegisteredPrism> = Object;

export const PrismProvider = defineComponent(
  (props: PrismProviderProps, { slots }) => {
    provide(
      PRISM_CONTEXT,
      computed(() => props.flags),
    );

    return () => slots.default?.();
  },
  {
    name: "PrismProvider",
    props: { flags: { type: flagsType, required: true } },
  },
);
