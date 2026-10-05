import { MEMBERSHIPS } from "examples/shared/courier/constants/memberships";
import type { UserId } from "examples/shared/courier/types/UserId";

export const getMemberships = (userId: UserId) =>
  MEMBERSHIPS.filter((membership) => membership.userId === userId);
