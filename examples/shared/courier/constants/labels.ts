import type { PrismStatus } from "@priemskiyyy/prism";
import type { Plan } from "examples/shared/courier/types/Plan";
import type { Region } from "examples/shared/courier/types/Region";
import type { Role } from "examples/shared/courier/types/Role";

export const STATUS_LABELS: Record<PrismStatus["state"], string> = {
  idle: "Idle",
  loading: "Loading",
  ready: "Ready",
  error: "Error",
  disposed: "Disposed",
};

export const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

export const REGION_LABELS: Record<Region, string> = {
  eu: "EU",
  us: "US",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  agent: "Agent",
};
