import { ProviderEvents } from "@openfeature/web-sdk";

export const CHANGE_EVENTS = [
  ProviderEvents.Ready,
  ProviderEvents.ConfigurationChanged,
  ProviderEvents.Stale,
];
