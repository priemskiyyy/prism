import type { CourierContext } from "examples/shared/courier/types/CourierContext";

export const getMembershipKey = ({ userId, workspaceId }: CourierContext) =>
  `${userId}@${workspaceId}`;
