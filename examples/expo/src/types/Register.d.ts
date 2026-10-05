import type { flags } from "src/flags/flags";

declare module "@priemskiyyy/prism-react" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging needs an interface.
  interface Register {
    prism: typeof flags;
  }
}
