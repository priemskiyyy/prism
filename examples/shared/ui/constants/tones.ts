import type { Resolution, PrismStatus } from "@priemskiyyy/prism";
import type { Tone } from "examples/shared/ui/types/Tone";

export const RESOLUTION_TONES: Record<Resolution, Tone> = {
  pending: "warning",
  resolved: "positive",
  missing: "neutral",
  error: "danger",
  override: "accent",
};

export const STATUS_TONES: Record<PrismStatus["state"], Tone> = {
  idle: "neutral",
  loading: "warning",
  ready: "positive",
  error: "danger",
  disposed: "neutral",
};
