# Example applications

Every example is the same product: Courier, a customer inbox where people belong to several workspaces, each with a plan, a region and a role. Eight typed flags decide what the page shows: the channels, the AI assistant, the new composer, the inbox layout, upload and contact limits, broadcasts and a maintenance notice. Switch workspace or user and the context changes, so every flag follows.

Run `pnpm build` from the repository root first. The examples import the built public packages.

| Example          | Run                                | What it shows                                                                                     |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| [React](react)   | `pnpm dev`                         | The full tour: flag inspector, six provider SDKs, a lab that breaks the flag service, a timeline. |
| [Vue](vue)       | `pnpm --filter example-vue dev`    | The inbox with `PrismProvider` and composables.                                                   |
| [Solid](solid)   | `pnpm --filter example-solid dev`  | The inbox with `PrismProvider` and accessors.                                                     |
| [Svelte](svelte) | `pnpm --filter example-svelte dev` | The inbox with `setPrism` and stores.                                                             |
| [Expo](expo)     | `pnpm --filter example-expo dev`   | A React Native inbox reading flags over HTTP from the fixture server, with pull-to-refresh.       |

Each web example registers the Courier Prism once and reads flags by key, `useFlag("composer")` in React, Vue and Solid and `flagStore("composer")` in Svelte, with the types the schemas declare. The React example also shows the devtools panel, which the Vue, Solid and Svelte examples mount without React.

## Shared code

`examples/shared` is the `example-shared` workspace package:

- `courier/` holds the domain: the flag declarations, workspaces, users and memberships, conversations, the inbox selection and a simulated flag backend with rollout rules, latency, outages and corrupt payloads.
- `courier/providers/` has one host per provider SDK (your own HTTP API, memory, OpenFeature, GrowthBook, Unleash and Statsig), all answering from the same backend, so every provider serves the same flags.
- `ui/` holds the Tailwind theme, the class recipes and a Phosphor icon map that the Vue, Solid and Svelte examples render through CSS masks.

The web examples run the backend inside the page, so they need no account and send nothing over the network.

## Fixture server

`pnpm dev:server` builds and starts `examples/server` on port 4318. It serves the Courier flags from the shared backend on `POST /api/flags` and changes the rules on `POST /api/control`, validating both bodies with Zod. The permissive CORS and the open control endpoint are there for local development only.

## Tests

`pnpm vitest run --project example-react` and the matching `example-vue`, `example-solid`, `example-svelte`, `example-shared` and `example-server` projects run the unit tests. `pnpm test:examples` builds the four web examples and drives them with Playwright at phone and desktop widths.
