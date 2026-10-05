# Courier on Expo

The Courier inbox as a React Native app. Unlike the web examples, it reads its flags over the network from the fixture server in `examples/server`, the way a mobile client reads them from your API.

```sh
pnpm build
pnpm dev:server
cp examples/expo/.env.example examples/expo/.env
pnpm --filter example-expo dev
```

On a physical device, set `EXPO_PUBLIC_FLAGS_URL` in `.env` to your computer's LAN address, such as `http://192.168.1.20:4318/api/flags`; `localhost` on the phone is the phone.

How it fits together:

- `src/flags/flags.ts` declares the one Prism: the shared Courier flags, read through `@priemskiyyy/prism-http` with the Zod-validated request client from `examples/shared`.
- `src/types/Register.d.ts` registers that instance, so `useFlag("composer")` autocompletes and returns a `boolean`.
- `index.tsx` starts the runtime, wraps the app in `PrismProvider`, and refreshes the flags whenever the app comes back to the foreground.
- `Application.tsx` switches workspace and user with `usePrism().context(...)` and refreshes on pull-to-refresh.
- Every card shows the flags it reads, each with a dot for its resolution.

The fixture server keeps its rules in memory, so you can change them while the app is open and pull down to see the result:

```sh
curl -X POST localhost:4318/api/control \
  -H 'content-type: application/json' \
  -d '{"composerRollout":"EVERYONE","maintenance":true}'
```

`composerRollout` takes `OFF`, `ADMINS` or `EVERYONE`, `assistantRollout` takes `OFF`, `PAID` or `EVERYONE`, and `maintenance`, `corruptChannels` and `offline` take booleans. `latency` takes `0`, `400` or `1500` milliseconds, and `failNext: true` fails the next read. CI typechecks and bundles the app for web, iOS and Android; it does not run it on a device.
