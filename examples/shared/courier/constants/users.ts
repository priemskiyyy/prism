import type { User } from "examples/shared/courier/types/User";
import type { UserId } from "examples/shared/courier/types/UserId";

export const USERS: Record<UserId, User> = {
  alex: { id: "alex", name: "Alex Morgan", initials: "AM" },
  blake: { id: "blake", name: "Blake Chen", initials: "BC" },
};

export const USER_IDS: UserId[] = ["alex", "blake"];
