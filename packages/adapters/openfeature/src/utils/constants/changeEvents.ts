import { ProviderEvents } from "@openfeature/server-sdk";

export const CHANGE_EVENTS = [
  ProviderEvents.Ready,
  ProviderEvents.ConfigurationChanged,
  ProviderEvents.Stale,
];
