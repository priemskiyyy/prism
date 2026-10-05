import type { Plan } from "examples/shared/courier/types/Plan";
import type { Region } from "examples/shared/courier/types/Region";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";

export type Workspace = {
  id: WorkspaceId;
  name: string;
  initials: string;
  plan: Plan;
  region: Region;
};
