import { findMembership } from "examples/shared/courier/directory/findMembership";
import { getMemberships } from "examples/shared/courier/directory/getMemberships";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export const findUserMembership = (userId: UserId, workspaceId: WorkspaceId) =>
  findMembership(userId, workspaceId) ?? getMemberships(userId)[0];
