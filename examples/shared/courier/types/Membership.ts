import type { Role } from "examples/shared/courier/types/Role";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export type Membership = {
  userId: UserId;
  workspaceId: WorkspaceId;
  role: Role;
};
