import { MEMBERSHIPS } from "examples/shared/courier/constants/memberships";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";

export const findCourierContext = (
  userId: string | null | undefined,
  workspaceId: string | null | undefined,
) => {
  const membership = MEMBERSHIPS.find(
    (candidate) =>
      candidate.userId === userId && candidate.workspaceId === workspaceId,
  );

  if (membership === undefined) {
    return undefined;
  }

  return getCourierContext(membership);
};
