import {
  Cloud,
  Cube,
  Database,
  Globe,
  Plugs,
  Rocket,
} from "@phosphor-icons/react";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import type { ProviderGuide } from "src/types/ProviderGuide";

export const PROVIDER_GUIDES: Record<ProviderId, ProviderGuide> = {
  HTTP: {
    name: "Your API",
    icon: Globe,
    summary: "Your own endpoint behind the API client you already have.",
    network: true,
    changes: "Rule changes arrive through the updates option.",
    snippet: `adapter: http({
  request: ({ context, keys, signal }) =>
    api.evaluateFlags({ context, keys }, { signal }),
}),
updates: (context, refresh) => realtime.subscribe(context, refresh),`,
  },
  MEMORY: {
    name: "Memory",
    icon: Database,
    summary: "Values from a function of the context, for tests and demos.",
    network: false,
    changes: "Rule changes arrive through the updates option.",
    snippet: `adapter: memory({
  values: (context) => rules.evaluate(context),
}),
updates: (context, refresh) => rules.subscribe(refresh),`,
  },
  OPENFEATURE: {
    name: "OpenFeature",
    icon: Plugs,
    summary: "Any OpenFeature web provider, here the in-memory one.",
    network: false,
    changes: "The provider's ConfigurationChanged event refreshes the flags.",
    snippet: `await OpenFeature.setProviderAndWait("courier", provider);

adapter: openFeature({
  client: OpenFeature.getClient("courier"),
  context: (context) => ({
    targetingKey: \`\${context.userId}@\${context.workspaceId}\`,
    ...context,
  }),
}),`,
  },
  GROWTHBOOK: {
    name: "GrowthBook",
    icon: Rocket,
    summary: "Features evaluated locally from targeting rules.",
    network: false,
    changes: "Payload changes reach the page through the renderer.",
    snippet: `adapter: growthbook({
  client,
  attributes: (context) => ({ id: context.userId, ...context }),
}),
updates: (_context, refresh) => {
  client.setRenderer(refresh);
  return () => client.setRenderer(null);
},`,
  },
  UNLEASH: {
    name: "Unleash",
    icon: Cube,
    summary: "Toggles, variants and payloads from the frontend API.",
    network: true,
    changes: "Every fetch that lands emits update and refreshes the flags.",
    snippet: `adapter: unleash({
  client,
  context: ({ userId, workspaceId, plan }) => ({
    userId,
    properties: { workspaceId, plan },
  }),
  resources: {
    "new-composer": { toggle: "new-composer", select: "enabled" },
    uploads: { toggle: "uploads", select: "payload" },
  },
}),`,
  },
  STATSIG: {
    name: "Statsig",
    icon: Cloud,
    summary: "Gates, dynamic configs and experiments per user.",
    network: true,
    changes: "values_updated refreshes the flags; reads log no exposures.",
    snippet: `adapter: statsig({
  client,
  user: ({ userId, workspaceId, plan }) => ({
    userID: userId,
    customIDs: { workspaceID: workspaceId },
    custom: { plan },
  }),
  resources: {
    "ai-assistant": { type: "gate", name: "ai-assistant" },
    uploads: { type: "config", name: "uploads", parameter: "value" },
  },
}),`,
  },
};
