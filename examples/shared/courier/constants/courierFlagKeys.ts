import { courierFlags } from "examples/shared/courier/flags";
import type { CourierFlagKey } from "examples/shared/courier/types/CourierFlagKey";

const isCourierFlagKey = (key: string): key is CourierFlagKey =>
  key in courierFlags;

export const COURIER_FLAG_KEYS =
  Object.keys(courierFlags).filter(isCourierFlagKey);
