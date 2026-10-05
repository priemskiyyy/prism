import type { Membership } from "examples/shared/courier/types/Membership";

export const MEMBERSHIPS: Membership[] = [
  { userId: "alex", workspaceId: "northwind", role: "admin" },
  { userId: "alex", workspaceId: "acme", role: "agent" },
  { userId: "alex", workspaceId: "globex", role: "agent" },
  { userId: "blake", workspaceId: "northwind", role: "agent" },
  { userId: "blake", workspaceId: "acme", role: "admin" },
];
