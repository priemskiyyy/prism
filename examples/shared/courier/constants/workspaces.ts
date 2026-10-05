import type { Workspace } from "examples/shared/courier/types/Workspace";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export const WORKSPACES: Record<WorkspaceId, Workspace> = {
  northwind: {
    id: "northwind",
    name: "Northwind Café",
    initials: "NC",
    plan: "starter",
    region: "eu",
  },
  acme: {
    id: "acme",
    name: "Acme Logistics",
    initials: "AL",
    plan: "business",
    region: "us",
  },
  globex: {
    id: "globex",
    name: "Globex Health",
    initials: "GH",
    plan: "enterprise",
    region: "eu",
  },
};
