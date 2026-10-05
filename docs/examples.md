---
description: "Courier, a multi-workspace customer inbox, built five times: React with a full lab, Vue, Solid, Svelte and an Expo app that reads flags over HTTP."
---

<script setup>
import { withBase } from "vitepress";
</script>

# Example applications

Every example is the same product. Courier is a customer inbox where people belong to several workspaces, each with its own plan, region and role, the way a messaging product for teams works. Eight typed flags decide what the page shows, and switching workspace or user changes the context, so every flag follows.

<a :href="withBase('/demo/')" target="_blank" rel="noreferrer">Open the live demo</a>. It is the React example, running entirely in the page.

![The Courier workspace in the React example, with dashed markers around every region a flag controls](/images/screenshots/courier.png)

## The flags

| Flag           | Schema                                       | What it controls                            |
| -------------- | -------------------------------------------- | ------------------------------------------- |
| `channels`     | Array of channel names, at least one         | Which inbox channels are open or locked     |
| `assistant`    | Boolean, provider key `ai-assistant`         | Suggested replies in the conversation       |
| `composer`     | Boolean, provider key `new-composer`         | The new or the classic reply composer       |
| `layout`       | `"classic"` or `"split"`, key `inbox-layout` | A stacked inbox or a list beside the thread |
| `uploads`      | `{ maxFiles, maxMegabytes }`                 | The attachment limits under the composer    |
| `campaigns`    | `{ enabled, dailyRecipients }`               | Whether the workspace can send broadcasts   |
| `contactLimit` | Positive integer, key `contact-limit`        | The contact quota and its meter             |
| `maintenance`  | `{ message }` or `null`                      | A banner above the workspace                |

Rollout rules live in a simulated backend: the composer reaches admins first, the assistant reaches paid plans, and each plan has its own channels and limits.

## Five applications

| Example | Run                                | What it shows                                                                                            |
| ------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| React   | `pnpm dev`                         | The full tour: the workspace, a flag inspector with overrides, six providers, a fault lab and a timeline |
| Vue     | `pnpm --filter example-vue dev`    | The workspace with `PrismProvider` and composables                                                       |
| Solid   | `pnpm --filter example-solid dev`  | The workspace with `PrismProvider` and accessors                                                         |
| Svelte  | `pnpm --filter example-svelte dev` | The workspace with `setPrism` and stores                                                                 |
| Expo    | `pnpm --filter example-expo dev`   | A React Native inbox that reads flags over HTTP, with pull-to-refresh                                    |

Run `pnpm install` and `pnpm build` at the repository root first. The examples use the built packages.

Every web example registers the Courier Prism once and reads flags by key. The dashed markers around each region come from `useFlagDetails` and show which flag drives it and how it resolved. A switch in the status bar hides them.

## The React tour

The React example is a guided page with five sections:

1. **Your workspace.** Switch workspace or user. Plan, role and region change, and every flag follows.
2. **Every flag, typed.** Each handle's value, resolution, variant and error, with local overrides that pass the flag's own schema.
3. **Swap the provider.** The same page on your own API, memory, OpenFeature, GrowthBook, Unleash or Statsig, with the setup each adapter needs.
4. **Break the flag service.** Change rollout rules, publish a maintenance notice, corrupt a payload, add latency, fail a request or go offline, and watch the request log.
5. **Watch it happen.** A timeline of status changes and flag updates as the runtime publishes them.

Every provider runs inside the page against the same simulated backend, so the demo needs no account and sends nothing over the network. The Prism devtools sit in the corner.

![The Prism devtools panel docked at the bottom of the page](/images/screenshots/devtools.png)

## The Expo app and the fixture server

The Expo app reads its flags from `examples/server`, a small Node server that serves the Courier flags from the same backend and lets you change the rules while the app is open:

```sh
pnpm dev:server
pnpm --filter example-expo dev
curl -X POST localhost:4318/api/control \
  -H 'content-type: application/json' \
  -d '{"composerRollout":"EVERYONE"}'
```

Pull down in the app to read the change. The app also refreshes whenever it returns to the foreground.

## Tests

The examples are tested like the packages. `pnpm vitest run --project example-react` and the matching Vue, Solid, Svelte, shared and server projects run the unit tests, and `pnpm test:examples` builds the four web examples and drives them with Playwright at phone and desktop widths.
