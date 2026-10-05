import { MEMBERSHIPS } from "examples/shared/courier/constants/memberships";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export const findMembership = (userId: UserId, workspaceId: WorkspaceId) =>
  MEMBERSHIPS.find(
    (membership) =>
      membership.userId === userId && membership.workspaceId === workspaceId,
  );
