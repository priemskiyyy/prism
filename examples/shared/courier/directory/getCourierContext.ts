import { WORKSPACES } from "examples/shared/courier/constants/workspaces";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { Membership } from "examples/shared/courier/types/Membership";

export const getCourierContext = ({
  userId,
  workspaceId,
  role,
}: Membership): CourierContext => {
  const { plan, region } = WORKSPACES[workspaceId];

  return { userId, workspaceId, role, plan, region };
};
