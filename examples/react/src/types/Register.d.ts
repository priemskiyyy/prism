import type { CourierPrism } from "examples/shared/courier/types/CourierPrism";

declare module "@priemskiyyy/prism-react" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging needs an interface.
  interface Register {
    prism: CourierPrism;
  }
}
