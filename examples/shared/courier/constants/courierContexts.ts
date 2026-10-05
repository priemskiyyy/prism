import { MEMBERSHIPS } from "examples/shared/courier/constants/memberships";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";

export const COURIER_CONTEXTS = MEMBERSHIPS.map(getCourierContext);
