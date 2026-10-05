# @priemskiyyy/prism-launchdarkly-react-native

LaunchDarkly React Native SDK (`@launchdarkly/react-native-client-sdk` 10.x) as a Prism adapter.

```ts
import {
  ReactNativeLDClient,
  AutoEnvAttributes,
} from "@launchdarkly/react-native-client-sdk";
import { launchdarkly } from "@priemskiyyy/prism-launchdarkly-react-native";

const client = new ReactNativeLDClient(mobileKey, AutoEnvAttributes.Enabled);
const adapter = launchdarkly({
  client,
  context: (context: { userId: string }) => ({
    kind: "user",
    key: context.userId,
  }),
});
```

The adapter identifies each new context through `identifyResult` with `noTimeout` and `sheddable: false`. An identify that ends as `error`, `timeout` or `shed` fails the read, and the next read retries it. Reads take `allFlags()`, which sends no evaluation events, so call a variation method where the user sees the flag to record an exposure. Change events refresh the runtime. The application owns the client. Device behavior is not verified by this repository's tests.
