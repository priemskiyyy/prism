import type { Plan } from "examples/shared/courier/types/Plan";
import type { Region } from "examples/shared/courier/types/Region";
import type { Role } from "examples/shared/courier/types/Role";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export type CourierContext = {
  userId: UserId;
  workspaceId: WorkspaceId;
  role: Role;
  plan: Plan;
  region: Region;
};
